import {
  View,
  // Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import DatePicker, { getDates } from "@/components/DatePicker";
import CustomHeader from "@/components/CustomHeader";
import Colors from "@/constants/Colors";
import { useAuthContext } from "@/providers/AuthProvider";
import { confirm } from "@/components/commonFunc";
import { useBookingList, useInsertBooking } from "@/api/bookingStatus";
import { useFacilityTypeList } from "@/api/facilities";
import { Tables } from "@/database.types";
import LoadingIndicator from "@/components/LodingIndicator";
import { useCommDataContext } from "@/providers/CommDataProvider";
import { supabase } from "@/lib/supabase";
import CustomText from "@/components/CustomText";

const Text = CustomText;

type TimeSlot = {
  time: string;
  selected: boolean;
};

type Facility = Tables<"facilities">;

const Practice = () => {
  const [dates, setDates] = useState<string[]>([]);
  const [currIndex, setCurrIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [loading, setLoading] = useState(false);

  const { getCodeByGroupAndCode } = useCommDataContext();

  const { user } = useAuthContext();
  const {
    data: bays,
    error: bayError,
    isLoading: bayLoading,
  } = useFacilityTypeList("Bay");

  const { mutate: insertBook } = useInsertBooking();

  useEffect(() => {
    const stdDates = getDates();
    setDates(stdDates);
    setSelectedDate(stdDates[0]);
  }, []);

  const {
    data: practice,
    error: pracError,
    isLoading: pracLoading,
  } = useBookingList("practice", selectedDate);

  const generateTimeSlots = (
    // hour: number,
    // minute: number,
    // endHour: number,
    startTime: string,
    endTime: string,
    bayId: number
  ): TimeSlot[] => {
    const timeSlots: TimeSlot[] = [];
    // const stdHour = minute === 0 ? 21 : 22;
    let [hour, minute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const stdHour = minute === 0 ? endHour - 2 : endHour - 1;
    const stdMinute = 30;

    const currentDate = new Date();
    const currentHour = currentDate.getHours();
    const currentMinute = currentDate.getMinutes();

    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const day = currentDate.getDate().toString().padStart(2, "0");
    const today = `${year}-${month}-${day}`;

    while (hour <= stdHour) {
      const startTime = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")}`;
      const endTimeHour = (minute === 0 ? hour + 1 : hour + 2)
        .toString()
        .padStart(2, "0");
      const endTimeMinute = (minute === 0 ? minute + 30 : 0)
        .toString()
        .padStart(2, "0");
      const endTime = `${endTimeHour}:${endTimeMinute}`;

      const timeSlot: TimeSlot = {
        selected: false,
        time: `${startTime}~${endTime}`,
      };

      const isBooked = practice?.some(
        (booking) =>
          booking.facility_id === bayId &&
          booking.start_tm <= startTime &&
          booking.end_tm >= endTime
      );

      if (isBooked) {
        timeSlot.selected = true;
      }

      if (selectedDate === today) {
        if (
          parseInt(endTimeHour) > currentHour ||
          (parseInt(endTimeHour) === currentHour &&
            parseInt(endTimeMinute) >= currentMinute)
        ) {
          timeSlots.push(timeSlot);
        }
      } else {
        timeSlots.push(timeSlot);
      }

      hour = parseInt(endTimeHour);
      minute = parseInt(endTimeMinute);
    }

    return timeSlots;
  };

  const strMaxCnt =
    getCodeByGroupAndCode("STD_TIME", "ODD_BAY_START_TIME") || "4";
  const maxCnt = parseInt(strMaxCnt);

  const onTimeClick = async (timeSlot: TimeSlot, bay: Facility) => {
    if (timeSlot.selected) return;

    let todayCnt = await checkAvailability();
    if (!todayCnt) todayCnt = 0;

    if (todayCnt >= maxCnt) {
      Alert.alert(
        `하루 최대 ${maxCnt} 타임 예약 가능합니다.\n금일 예약 건수: ${todayCnt}`
      );
      return;
    }

    if (
      !(await confirm(
        "연습예약",
        `${selectedDate} ${timeSlot.time}\n${user?.user_name} 님으로 예약하시겠습니까?`
      ))
    ) {
      return;
    }

    const [sTime, eTime] = timeSlot.time.split("~");
    try {
      setLoading(true);
      insertBook(
        {
          branch_id: 1,
          booking_type: "practice",
          user_id: user.user_id,
          user_name: user.user_name,
          facility_id: bay.facility_id,
          display_name: bay.display_name,
          booking_dt: selectedDate,
          start_tm: sTime,
          end_tm: eTime,
          status: "BOOKED",
        },
        {
          onSuccess: () => {
            Alert.alert("예약되었습니다.");
          },
        }
      );
    } catch (err) {
      console.error("Error booking practice:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("booking_status")
        .select("*")
        .eq("booking_dt", selectedDate)
        .eq("status", "BOOKED")
        .eq("booking_type", "practice")
        .eq("user_id", user.user_id);

      if (error) {
        throw new Error(error.message);
      }

      return data === null || data === undefined ? 0 : data.length;
    } catch (err) {
      console.error("Error booking practice checkAvailability:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader headerTtitle="연습 예약" />
      <DatePicker
        selectedDate={selectedDate}
        currIndex={currIndex}
        dates={dates}
        setSelectedDate={setSelectedDate}
        setCurrIndex={setCurrIndex}
      />

      <ScrollView style={styles.table}>
        {bays && bays.length > 0 && (
          <View style={styles.info}>
            <View
              style={{
                flex: 1,
                gap: 10,
                alignItems: "flex-end",
              }}
            >
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Text style={styles.possible}>예약가능</Text>
                <Text style={styles.impossible}>예약불가</Text>
              </View>
            </View>
          </View>
        )}
        {bays && bays.length > 0 ? (
          bays.map((bay, idx) => {
            const timeSlots =
              idx % 2 === 1
                ? generateTimeSlots(
                    getCodeByGroupAndCode("STD_TIME", "ODD_BAY_START_TIME") ||
                      "06:00",
                    getCodeByGroupAndCode("STD_TIME", "ODD_BAY_END_TIME") ||
                      "23:00",
                    bay.facility_id
                  )
                : generateTimeSlots(
                    getCodeByGroupAndCode("STD_TIME", "EVEN_BAY_START_TIME") ||
                      "06:00",
                    getCodeByGroupAndCode("STD_TIME", "EVEN_BAY_END_TIME") ||
                      "23:00",
                    bay.facility_id
                  );
            return (
              <View key={bay.facility_id} style={{ flexDirection: "row" }}>
                <View style={styles.bayContainer}>
                  <Text style={styles.bayText}>{bay.display_name}</Text>
                </View>
                <View style={styles.timeContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.scrollViewContent}>
                      {timeSlots.map((timeSlot) => (
                        <TouchableOpacity
                          key={timeSlot.time}
                          style={[
                            styles.timeSlot,
                            timeSlot.selected
                              ? { backgroundColor: Colors.gray }
                              : {},
                          ]}
                          disabled={timeSlot.selected}
                          onPress={() => onTimeClick(timeSlot, bay)}
                        >
                          <Text style={styles.timeSlotText}>
                            {timeSlot.time}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>이용 가능 시간이 아닙니다.</Text>
            <Text style={styles.emptyText}>다른 날짜를 선택하세요.</Text>
          </View>
        )}
      </ScrollView>
      {(loading || bayLoading || pracLoading) && <LoadingIndicator />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
  },
  table: {
    flex: 1,
    height: "100%",
    // alignItems: "center",
  },
  bayContainer: {
    width: "25%",
    borderRightWidth: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  bayText: {
    fontWeight: "bold",
  },
  timeContainer: {
    width: "75%",
    padding: 10,
  },
  scrollViewContent: {
    flexDirection: "row",
    gap: 10,
  },
  timeSlot: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 20,
    padding: 5,
  },
  timeSlotText: {
    fontSize: 12,
    marginHorizontal: 5,
    textAlign: "center",
  },
  empty: {
    marginTop: 100,
    gap: 10,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  info: {
    flexDirection: "row",
    marginTop: 30,
    marginBottom: 10,
  },
  possible: {
    fontSize: 10,
    fontWeight: "bold",
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 11,
    padding: 5,
    textAlign: "center",
  },
  impossible: {
    fontSize: 10,
    fontWeight: "bold",
    borderWidth: 1,
    borderColor: Colors.gray,
    backgroundColor: Colors.gray,
    overflow: "hidden",
    borderRadius: 11,
    padding: 5,
    textAlign: "center",
  },
});

export default Practice;
