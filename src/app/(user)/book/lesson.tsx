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
import { confirm, getFormatDate } from "@/components/commonFunc";
import { useBookingList, useInsertBooking } from "@/api/bookingStatus";
import LoadingIndicator from "@/components/LodingIndicator";
import { useInsertApproval } from "@/api/approvals";
import { Tables } from "@/database.types";
import { useCommDataContext } from "@/providers/CommDataProvider";
import { useFacilityTypeList } from "@/api/facilities";
import { router } from "expo-router";
import { sendPushNotificationToUser } from "@/lib/notifications";
import CustomText from "@/components/CustomText";

const Text = CustomText;

interface TimeSlot {
  time: string;
  selected: boolean;
  status: string;
}

type Booking = Tables<"booking_status">;
type Facility = Tables<"facilities">;

const Lesson = () => {
  const { user } = useAuthContext();
  const [dates, setDates] = useState<string[]>([]);
  const [currIndex, setCurrIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const { getCodeByGroupAndCode } = useCommDataContext();

  const {
    data: bays,
    error: bayError,
    isLoading: bayLoading,
  } = useFacilityTypeList("Lesson");

  // const startTime = "09:00";
  // const endTime = "21:00";
  // const timeInterval = 60;

  useEffect(() => {
    const stdDates = getDates();
    setDates(stdDates);
    setSelectedDate(stdDates[0]);
  }, []);

  const {
    data: lesson,
    error,
    isLoading,
  } = useBookingList("lesson", selectedDate);

  const { mutate: insertBook } = useInsertBooking();
  const { mutate: insertApproval } = useInsertApproval();

  useEffect(() => {
    const startTime =
      getCodeByGroupAndCode("STD_TIME", "LESSON_START_TIME") || "09:00";
    const endTime =
      getCodeByGroupAndCode("STD_TIME", "LESSON_END_TIME") || "21:00";
    const timeInterval = parseInt(
      getCodeByGroupAndCode("STD_TIME", "LESSON_INTERVAL_TIME") || "60"
    );

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const day = currentDate.getDate().toString().padStart(2, "0");
    const today = `${year}-${month}-${day}`;

    let startDate;
    const startTimeDate = new Date(`${selectedDate}T${startTime}:00`);
    if (selectedDate === today) {
      const currentHour = (currentDate.getHours() + 1)
        .toString()
        .padStart(2, "0");
      const currentMinutes = currentDate.getMinutes();
      const currentDateTime = new Date(
        `${selectedDate}T${currentHour}:${currentMinutes}:00`
      );

      // startDate = new Date(`${selectedDate}T${currentHour}:00:00`);
      startDate =
        currentDateTime > startTimeDate ? currentDateTime : startTimeDate;
    } else {
      startDate = new Date(`${selectedDate}T${startTime}:00`);
    }

    const endDate = new Date(`${selectedDate}T${endTime}:00`);
    const timeSlots: TimeSlot[] = [];

    let currentTime = startDate;
    while (currentTime < endDate) {
      const currentHour = currentTime.getHours().toString().padStart(2, "0");
      const nextHour = (currentTime.getHours() + 1).toString().padStart(2, "0");
      const timeSlotString = `${currentHour}:00 ~ ${nextHour}:00`;

      const book = lesson?.find(
        (book) =>
          book.start_tm === `${currentHour}:00` &&
          book.end_tm === `${nextHour}:00`
      );

      const timeSlot: TimeSlot = {
        selected: book ? true : false,
        time: timeSlotString,
        status: !book ? "" : book.status,
      };

      timeSlots.push(timeSlot);
      currentTime.setMinutes(currentTime.getMinutes() + timeInterval);
      // currentTime.setMinutes(currentTime.getMinutes() + timeInterval);
    }

    setTimeSlots(timeSlots);
  }, [selectedDate, lesson]);

  const onTimeClick = async (timeSlot: TimeSlot) => {
    if (!bays || bays.length <= 0) {
      Alert.alert("연습장 사정 상 현재는 레슨 예약을 하실 수 없습니다.");
      return;
    }
    if (timeSlot.selected) return;
    if (
      !(await confirm(
        "레슨예약",
        `${selectedDate} ${timeSlot.time}\n${user?.user_name} 님으로 예약하시겠습니까?`
      ))
    ) {
      return;
    }

    const [sTime, eTime] = timeSlot.time.split(" ~ ");

    try {
      setLoading(true);
      insertBook(
        {
          branch_id: 1,
          booking_type: "lesson",
          user_id: user.user_id,
          user_name: user.user_name,
          facility_id: 0,
          display_name: "Lesson",
          booking_dt: selectedDate,
          start_tm: sTime,
          end_tm: eTime,
          status: "WAITING",
        },
        {
          onSuccess: (newBooking) => {
            regApproval(newBooking);
            // Alert.alert("예약되었습니다.");
          },
        }
      );
    } catch (err) {
      console.error("Error booking lesson:", err);
    } finally {
      setLoading(false);
    }
  };

  const regApproval = async (newBooking: Booking) => {
    try {
      setLoading(true);
      insertApproval(
        {
          branch_id: 1,
          appr_type: "lesson",
          type_id: newBooking.booking_id,
          user_id: user.user_id,
          user_name: user.user_name,
          appr_stts: "PROGRESS",
          appr_dt: getFormatDate(new Date()),
          std_dt: newBooking.booking_dt,
          std_start_tm: newBooking.start_tm,
          std_end_tm: newBooking.end_tm,
          create_id: String(user.user_id),
        },
        {
          onSuccess: () => {
            Alert.alert(
              "예약되었습니다. 연습장에서 확인 후 예약이 확정됩니다."
            );

            sendPushNotificationToUser(
              "Lesson reservation",
              "Lesson reservation has been requested.",
              "myapp://admin/manage/approvals"
            );

            router.push("/(user)/");
          },
        }
      );
    } catch (err) {
      console.error("Error lesson approval insert:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader headerTtitle="골프레슨 예약" />
      <DatePicker
        selectedDate={selectedDate}
        currIndex={currIndex}
        dates={dates}
        setSelectedDate={setSelectedDate}
        setCurrIndex={setCurrIndex}
      />
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
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.scrollViewContent}>
          {timeSlots && timeSlots.length > 0 ? (
            timeSlots.map((timeSlot, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.timeContainer,
                  timeSlot.selected ? { backgroundColor: Colors.gray } : {},
                ]}
                onPress={() => onTimeClick(timeSlot)}
                disabled={timeSlot.selected}
              >
                <Text>{`${timeSlot.time} ${
                  timeSlot.status === "BOOKED"
                    ? ""
                    : timeSlot.status === ""
                    ? ""
                    : "(승인대기중)"
                }`}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>이용 가능 시간이 아닙니다.</Text>
              <Text style={styles.emptyText}>다른 날짜를 선택하세요.</Text>
            </View>
          )}
        </View>
      </ScrollView>
      {(loading || isLoading || bayLoading) && <LoadingIndicator />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
  },
  content: {
    flex: 1,
    height: "100%",
    marginTop: 20,
  },
  scrollViewContent: {
    flexDirection: "column",
    gap: 10,
  },
  info: {
    flexDirection: "row",
    marginTop: 30,
  },
  possible: {
    fontSize: 10,
    fontWeight: "bold",
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 8,
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
    borderRadius: 8,
    padding: 5,
    textAlign: "center",
  },
  timeContainer: {
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 10,
    alignItems: "center",
    padding: 7,
  },
  empty: {
    marginTop: 100,
    gap: 10,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default Lesson;
