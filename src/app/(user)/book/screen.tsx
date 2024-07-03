import {
  View,
  // Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import DatePicker, { getDates } from "@/components/DatePicker";
import { Feather, Ionicons } from "@expo/vector-icons";
import CustomButton from "@/components/CustomButton";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import CustomHeader from "@/components/CustomHeader";
import Colors from "@/constants/Colors";
import { Tables } from "@/database.types";
import { useFacilityTypeList } from "@/api/facilities";
import LoadingIndicator from "@/components/LodingIndicator";
import { useInsertBooking } from "@/api/bookingStatus";
import { useAuthContext } from "@/providers/AuthProvider";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useCommDataContext } from "@/providers/CommDataProvider";
import { getFormatDate, confirm } from "@/components/commonFunc";
import CustomText from "@/components/CustomText";

const Text = CustomText;

const userNums = [1, 2, 3, 4];

type Facility = Tables<"facilities">;
type Booking = Tables<"booking_status">;

const Screen = () => {
  const [dates, setDates] = useState<string[]>([]);
  const [currIndex, setCurrIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const today = getFormatDate(new Date());
  const [selectedNum, setSelectedNum] = useState(1);
  const [selectedScreen, setSelectedScreen] = useState<Facility>();

  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [loading, setLoading] = useState(false);
  const { user } = useAuthContext();
  const router = useRouter();

  const { getCodeByGroupAndCode } = useCommDataContext();

  const stdStartTime =
    getCodeByGroupAndCode("STD_TIME", "SCREEN_START_TIME") || "07:00";
  const stdEndTime =
    getCodeByGroupAndCode("STD_TIME", "SCREEN_END_TIME") || "23:00";

  useEffect(() => {
    const stdDates = getDates();

    setDates(stdDates);
    setSelectedDate(stdDates[0]);
  }, []);

  const [isToday, setIsToday] = useState(false);

  useEffect(() => {
    if (selectedDate) setIsToday(selectedDate === today);
  }, [selectedDate]);

  const {
    data: screens,
    error: screenError,
    isLoading: screenLoading,
  } = useFacilityTypeList("Screen");

  useEffect(() => {
    getBookings();
  }, [selectedScreen, selectedDate]);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const getBookings = async () => {
    if (!selectedScreen || !selectedDate) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("booking_status")
        .select("*")
        .eq("booking_dt", selectedDate)
        .eq("status", "BOOKED")
        .eq("booking_type", "screen")
        .eq("facility_id", selectedScreen.facility_id)
        .order("facility_id", { ascending: true });
      if (error) {
        throw new Error(error.message);
      }
      setBookings(data);
    } catch (err) {
      console.error("Error orderStatus getBookings:", err);
    } finally {
      setLoading(false);
    }
  };

  const { mutate: insertBook } = useInsertBooking();

  const onScreenBook = async () => {
    if (!selectedNum || !selectedScreen || !startTime) {
      Alert.alert("Select Participants, Screen and Booking Time.");
      return;
    }

    if (isTimeWithinRange(startTime, endTime) === "1") {
      if (
        !(await confirm(
          "스크린예약",
          `We close at ${stdEndTime}. Would you still like to book?`
        ))
      ) {
        return;
      }
    } else if (!isTimeWithinRange(startTime, endTime)) {
      Alert.alert(
        `Booking is available between ${stdStartTime} and${stdEndTime}`
      );
      return;
    }

    const isAvailable = await checkAvailability();
    if (!isAvailable) {
      Alert.alert("There is already a booking at the selected time.");
      return;
    }

    try {
      setLoading(true);
      insertBook(
        {
          branch_id: 1,
          booking_type: "screen",
          user_id: user.user_id,
          user_name: user.user_name,
          facility_id: selectedScreen.facility_id,
          display_name: selectedScreen.display_name,
          booking_dt: selectedDate,
          start_tm: startTime,
          end_tm: endTime,
          player_cnt: selectedNum,
          status: "BOOKED",
        },
        {
          onSuccess: () => {
            Alert.alert("It has been booked.");
            router.push("/(user)/");
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
    if (!selectedScreen || !selectedDate || !startTime || !endTime)
      return false;
    try {
      const { data, error } = await supabase
        .from("booking_status")
        .select("*")
        .eq("booking_dt", selectedDate)
        .eq("status", "BOOKED")
        .eq("booking_type", "screen")
        .eq("facility_id", selectedScreen.facility_id)
        .or(
          `and(start_tm.lte.${startTime},end_tm.gt.${startTime}),and(start_tm.lt.${endTime},end_tm.gte.${endTime})`
        );

      if (error) {
        throw new Error(error.message);
      }

      return data.length === 0;
    } catch (err) {
      console.error("Error checking screen booking availability:", err);
      return false;
    }
  };

  const convertToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const isTimeWithinRange = (start: string, end: string) => {
    const startTime = convertToMinutes(start);
    const endTime = convertToMinutes(end);
    const stdStart = convertToMinutes(stdStartTime);
    const stdEnd = convertToMinutes(stdEndTime);
    const maxEnd = convertToMinutes("23:59");

    if (
      endTime > stdEnd &&
      endTime >= convertToMinutes("23:00") &&
      endTime <= maxEnd
    ) {
      return "1";
    }

    return (
      startTime >= stdStart &&
      startTime <= stdEnd &&
      endTime >= stdStart &&
      endTime <= stdEnd
    );
  };

  const toggleTimePicker = () => {
    setShowPicker((prev) => !prev);
  };

  useEffect(() => {
    if (!selectedNum || !startTime) return;

    const interval = parseInt(
      getCodeByGroupAndCode("STD_TIME", "SCREEN_INTERVAL_TIME") || "50"
    );
    const newDate = new Date(selectedDate);
    const [startHour, startMinute] = startTime.split(":");

    newDate.setHours(parseInt(startHour));
    newDate.setMinutes(parseInt(startMinute) + interval * selectedNum);
    const endHour = newDate.getHours().toString().padStart(2, "0");
    const endMinute = newDate.getMinutes().toString().padStart(2, "0");
    setEndTime(endHour + ":" + endMinute);
  }, [selectedNum, startTime]);

  return (
    <View style={styles.container}>
      <CustomHeader headerTtitle="Screen Golf" />
      <DatePicker
        selectedDate={selectedDate}
        currIndex={currIndex}
        dates={dates}
        setSelectedDate={setSelectedDate}
        setCurrIndex={setCurrIndex}
      />

      {isToday &&
      new Date().getTime() > new Date(`${today}T${stdEndTime}`).getTime() ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Not available during this time.</Text>
          <Text style={styles.emptyText}>Please choose another date.</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.label}>
            <Feather
              name="users"
              size={24}
              color={Colors.black}
              style={styles.userNumIcon}
            />
            <Text style={styles.userNumText}>Participants</Text>
          </View>
          <View style={[styles.label, { justifyContent: "space-between" }]}>
            {userNums.map((userNum, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.userNumCheap,
                  {
                    backgroundColor:
                      selectedNum === userNum ? Colors.lightgray : Colors.white,
                  },
                ]}
                onPress={() => setSelectedNum(userNum)}
              >
                <Text
                  style={[
                    styles.userNumNumber,
                    {
                      color:
                        selectedNum === userNum ? Colors.black : Colors.gray,
                    },
                    { fontWeight: selectedNum === userNum ? "bold" : "300" },
                  ]}
                >
                  {userNum}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.label}>
            <Ionicons
              name="timer-outline"
              size={24}
              color={Colors.black}
              style={styles.userNumIcon}
            />
            <Text style={styles.userNumText}>Screen</Text>
          </View>
          <View style={[styles.label, { justifyContent: "space-between" }]}>
            {screens &&
              screens.map((screen, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.userNumCheap,
                    { width: "40%" },
                    {
                      backgroundColor:
                        selectedScreen?.facility_id === screen.facility_id
                          ? Colors.lightgray
                          : Colors.white,
                    },
                  ]}
                  onPress={() => setSelectedScreen(screen)}
                >
                  <Text
                    style={[
                      styles.userNumNumber,
                      {
                        color:
                          selectedScreen?.facility_id === screen.facility_id
                            ? Colors.black
                            : Colors.gray,
                      },
                      {
                        fontWeight:
                          selectedScreen?.display_name === screen.display_name
                            ? "bold"
                            : "300",
                      },
                    ]}
                  >
                    {screen.display_name}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>

          <View style={styles.label}>
            <Ionicons
              name="timer-outline"
              size={24}
              color={Colors.black}
              style={styles.userNumIcon}
            />
            <Text style={styles.userNumText}>Booking Time</Text>
          </View>
          <View style={{ alignItems: "flex-start", marginTop: 30 }}>
            {bookings.map((booking) => (
              <View key={booking.booking_id}>
                <Text>{`${booking.start_tm} ~ ${booking.end_tm} Not available`}</Text>
              </View>
            ))}
          </View>
          <View
            style={{
              flexDirection: "column",
              marginTop: 30,
              marginBottom: -15,
              alignItems: "flex-end",
            }}
          >
            <Text style={{ color: Colors.light.tint }}>
              Select Participants, Booking Time.
            </Text>
            <Text style={{ color: Colors.light.tint }}>
              The end time is automatically calculated.
            </Text>
          </View>
          <View style={[styles.label, { justifyContent: "space-between" }]}>
            <Text style={{ width: "22%" }}>Start Time: </Text>
            <TouchableOpacity style={styles.time} onPress={toggleTimePicker}>
              <Text style={{ textAlign: "center" }}>{startTime}</Text>
              <DateTimePickerModal
                isVisible={showPicker}
                mode="time"
                onConfirm={(date) => {
                  const startHours = date
                    .getHours()
                    .toString()
                    .padStart(2, "0");
                  const startMinutes = date
                    .getMinutes()
                    .toString()
                    .padStart(2, "0");
                  setStartTime(startHours + ":" + startMinutes);

                  toggleTimePicker();
                }}
                onCancel={toggleTimePicker}
                minuteInterval={10}
                date={
                  startTime
                    ? new Date(
                        new Date().setHours(
                          parseInt(startTime.split(":")[0]),
                          parseInt(startTime.split(":")[1])
                        )
                      )
                    : new Date()
                }
              />
            </TouchableOpacity>
            <View style={{ width: 10 }} />
            <Text style={{ width: "22%" }}>End Time: </Text>
            <View style={styles.time}>
              <Text style={{ textAlign: "center" }}>{endTime}</Text>
            </View>
          </View>
          <View style={{ marginTop: 30 }} />
          <CustomButton text="Booking" onPress={onScreenBook} />
        </View>
      )}
      {(loading || screenLoading) && <LoadingIndicator />}
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
  },
  label: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
  },
  userNumIcon: {
    marginRight: 20,
  },
  userNumText: {
    fontSize: 18,
    fontWeight: "600",
  },
  userNumCheap: {
    width: "20%",
    fontWeight: "500",
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 5,
    padding: 5,
  },
  userNumNumber: {
    fontSize: 16,
    textAlign: "center",
    color: "gray",
  },
  time: {
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    justifyContent: "center",
    width: "25%",
    height: 30,
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

export default Screen;
