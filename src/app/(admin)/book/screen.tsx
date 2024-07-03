import {
  View,
  // Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  // TextInput,
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
import SelectDropdown from "react-native-select-dropdown";
import { AntDesign } from "@expo/vector-icons";
import { useCommDataContext } from "@/providers/CommDataProvider";
import CustomText from "@/components/CustomText";
import CustomTextInput from "@/components/\bCustomTextInput";
import { confirm } from "@/components/commonFunc";

const Text = CustomText;
const TextInput = CustomTextInput;

const userNums = [1, 2, 3, 4];

type Facility = Tables<"facilities">;
type Booking = Tables<"booking_status">;

const Screen = () => {
  const [dates, setDates] = useState<string[]>([]);
  const [currIndex, setCurrIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [selectedNum, setSelectedNum] = useState(1);
  const [selectedScreen, setSelectedScreen] = useState<Facility>();

  const [showPicker, setShowPicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [userName, setUserName] = useState("");
  const [mbrType, setMbrType] = useState("");

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
      console.error("Error query screen booking status:", err);
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

    if (!userName || !mbrType) {
      Alert.alert("Select User name, Membership type.");
      return;
    }

    if (isTimeWithinRange(startTime, endTime) === "1") {
      if (
        !(await confirm(
          "Book Screen",
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
      Alert.alert("There is already booking at the selected time.");
      return;
    }

    try {
      setLoading(true);
      insertBook(
        {
          branch_id: 1,
          booking_type: "screen",
          user_id: user.user_id,
          user_name: userName,
          facility_id: selectedScreen.facility_id,
          display_name: selectedScreen.display_name,
          booking_dt: selectedDate,
          start_tm: startTime,
          end_tm: endTime,
          player_cnt: selectedNum,
          status: "BOOKED",
          member: mbrType,
          description: "Walk In",
        },
        {
          onSuccess: () => {
            Alert.alert("It has been booked.");
            router.push("/(admin)/");
          },
        }
      );
    } catch (err) {
      console.error("Error booking screen:", err);
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

    // const interval = 50;
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

  const onSelect = (item: { title: string }) => {
    setMbrType(item.title);
  };

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

      {/* <View style={styles.content}> */}
      <ScrollView showsHorizontalScrollIndicator={false} style={styles.content}>
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
                    color: selectedNum === userNum ? Colors.black : Colors.gray,
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
                // const startHours = date.getHours();
                // const startMinutes = date.getMinutes();
                const startHours = date.getHours().toString().padStart(2, "0");
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
          <Text style={{ width: "20%" }}>End Time: </Text>
          <View style={styles.time}>
            <Text style={{ textAlign: "center" }}>{endTime}</Text>
          </View>
        </View>
        <View style={{ marginVertical: 10 }} />
        <View
          style={[styles.rowContainer, { justifyContent: "space-between" }]}
        >
          <Text style={styles.modalText}>Name: </Text>
          <TextInput
            style={styles.modalInput}
            value={userName}
            onChangeText={setUserName}
          />
        </View>
        <View style={styles.rowContainer}>
          <Text style={styles.modalText}>Member: </Text>
          <View
            style={{
              width: "65%",
              borderColor: Colors.light.tint,
              borderWidth: 1,
              borderRadius: 5,
              height: 30,
            }}
          >
            <SelectDropdown
              data={[{ title: "MEMBER" }, { title: "GUEST" }]}
              onSelect={onSelect}
              renderButton={(selectedItem, isOpened) => {
                return (
                  <View style={styles.dropdownButtonStyle}>
                    <Text style={{ fontSize: 12 }}>
                      {selectedItem ? selectedItem.title : ""}
                    </Text>
                    <AntDesign
                      name={isOpened ? "up" : "down"}
                      size={14}
                      color={Colors.black}
                    />
                  </View>
                );
              }}
              renderItem={(item, index, isSelected) => {
                return (
                  <View
                    style={{
                      ...styles.dropdownItemStyle,
                      ...(isSelected && { backgroundColor: "#D2D9DF" }),
                    }}
                  >
                    <Text style={styles.dropdownItemTxtStyle}>
                      {item.title}
                    </Text>
                  </View>
                );
              }}
              showsVerticalScrollIndicator={false}
              dropdownStyle={styles.dropdownMenuStyle}
            />
          </View>
        </View>
      </ScrollView>
      <CustomButton text="Booking" onPress={onScreenBook} />
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
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "space-between",
  },
  modalText: {
    width: "35%",
  },
  modalInput: {
    color: Colors.black,
    borderColor: Colors.light.tint,
    borderWidth: 1,
    height: 30,
    width: "65%",
    borderRadius: 5,
    padding: 5,
    paddingHorizontal: 10,
  },
  dropdownButtonStyle: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 30,
    padding: 5,
  },
  dropdownItemStyle: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 14,
    color: Colors.black,
  },
  dropdownMenuStyle: {
    borderRadius: 8,
  },
});

export default Screen;
