import {
  View,
  // Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  // TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import DatePicker, { getDates } from "@/components/DatePicker";
import CustomHeader from "@/components/CustomHeader";
import Colors from "@/constants/Colors";
import { Tables } from "@/types";
import { useAuthContext } from "@/providers/AuthProvider";
import { useFacilityTypeList } from "@/api/facilities";
import { useBookingList, useInsertBooking } from "@/api/bookingStatus";
import { confirm } from "@/components/commonFunc";
import LoadingIndicator from "@/components/LodingIndicator";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import CustomButton from "@/components/CustomButton";
import SelectDropdown from "react-native-select-dropdown";
import { useCommDataContext } from "@/providers/CommDataProvider";
import CustomText from "@/components/CustomText";
import CustomTextInput from "@/components/\bCustomTextInput";

const Text = CustomText;
const TextInput = CustomTextInput;

type TimeSlot = {
  time: string;
  selected: boolean;
};

type Facility = Tables<"facilities">;

type BookingInfo = {
  timeSlot: TimeSlot;
  bay: Facility;
};

const Practice = () => {
  const [dates, setDates] = useState<string[]>([]);
  const [currIndex, setCurrIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingInfo>();

  const [userName, setUserName] = useState("");
  const [mbrType, setMbrType] = useState("");

  const [loading, setLoading] = useState(false);

  const { getCodeByGroupAndCode } = useCommDataContext();

  useEffect(() => {
    const stdDates = getDates();

    setDates(stdDates);
    setSelectedDate(stdDates[0]);
  }, []);

  const { user } = useAuthContext();
  const {
    data: bays,
    error: bayError,
    isLoading: bayLoading,
  } = useFacilityTypeList("Bay");

  const { mutate: insertBook } = useInsertBooking();

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

      timeSlots.push(timeSlot);

      hour = parseInt(endTimeHour);
      minute = parseInt(endTimeMinute);
    }

    return timeSlots;
  };

  const onBookClick = async () => {
    if (!userName || !mbrType || !selectedBooking) {
      Alert.alert("Info", "Enter user name and membership type.");
      return;
    }

    if (
      !(await confirm(
        "Practice",
        `${selectedDate} ${selectedBooking.timeSlot.time}\nDo you want to make a reservation?`
      ))
    ) {
      setMbrType("");
      setUserName("");
      return;
    }

    const [sTime, eTime] = selectedBooking.timeSlot.time.split("~");
    try {
      setLoading(true);
      insertBook(
        {
          branch_id: 1,
          booking_type: "practice",
          user_id: user.user_id,
          user_name: userName,
          facility_id: selectedBooking.bay.facility_id,
          display_name: selectedBooking.bay.display_name,
          booking_dt: selectedDate,
          start_tm: sTime,
          end_tm: eTime,
          status: "BOOKED",
          member: mbrType,
          description: "Walk In",
        },
        {
          onSuccess: () => {
            Alert.alert("It has been booked.");
          },
        }
      );
    } catch (err) {
      console.error("Error booking practice:", err);
    } finally {
      setLoading(false);
      setMbrType("");
      setUserName("");
      setIsModalVisible(false);
    }
  };

  const onSelect = (item: { title: string }) => {
    setMbrType(item.title);
  };

  return (
    <View style={styles.container}>
      <CustomHeader headerTtitle="Practice" />
      <DatePicker
        selectedDate={selectedDate}
        currIndex={currIndex}
        dates={dates}
        setSelectedDate={setSelectedDate}
        setCurrIndex={setCurrIndex}
      />

      <View style={styles.table}>
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
                <Text style={styles.possible}>Available</Text>
                <Text style={styles.impossible}>Unavailable</Text>
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
                          onPress={() => {
                            if (timeSlot.selected) return;
                            setSelectedBooking({ timeSlot, bay });
                            setIsModalVisible(true);
                          }}
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
            <Text style={styles.emptyText}>
              Not available during this time.
            </Text>
            <Text style={styles.emptyText}>Please choose another date.</Text>
          </View>
        )}
      </View>

      <Modal
        animationType="fade"
        visible={isModalVisible}
        onRequestClose={() => {
          setMbrType("");
          setUserName("");
          setIsModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.rowContainer}>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                Practice Booking
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setMbrType("");
                  setUserName("");
                  setIsModalVisible(false);
                }}
              >
                <FontAwesome name="close" size={24} color="black" />
              </TouchableOpacity>
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
                  // defaultValue={"ALL"}
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
          </View>
          <CustomButton text="Save" onPress={onBookClick} />
        </View>
      </Modal>
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
    alignItems: "center",
  },
  bayContainer: {
    width: "20%",
    borderRightWidth: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  bayText: {
    fontWeight: "bold",
  },
  timeContainer: {
    width: "80%",
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
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(128,128,128,0.5)",
  },
  modalContent: {
    width: "90%",
    height: 180,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
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

export default Practice;
