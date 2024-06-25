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
import { useAuthContext } from "@/providers/AuthProvider";
import { confirm } from "@/components/commonFunc";
import {
  useBookingList,
  useInsertBooking,
  useUpdateBooking,
} from "@/api/bookingStatus";
import LoadingIndicator from "@/components/LodingIndicator";
import CustomButton from "@/components/CustomButton";
import SelectDropdown from "react-native-select-dropdown";
import { FontAwesome, AntDesign } from "@expo/vector-icons";
import { useUpdateApprovalByType } from "@/api/approvals";
import { Tables } from "@/database.types";
import { useCommDataContext } from "@/providers/CommDataProvider";
import CustomText from "@/components/CustomText";
import CustomTextInput from "@/components/\bCustomTextInput";

const Text = CustomText;
const TextInput = CustomTextInput;

interface TimeSlot {
  time: string;
  selected: boolean;
  status: string;
  booking_id: number;
}

type Booking = Tables<"booking_status">;

const Lesson = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const [dates, setDates] = useState<string[]>([]);
  const [currIndex, setCurrIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userName, setUserName] = useState("");
  const [mbrType, setMbrType] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot>();

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const { getCodeByGroupAndCode } = useCommDataContext();

  // const startTime = "09:00";
  // const endTime = "21:00";
  // const timeInterval = 1;

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
  const { mutate: updateBook } = useUpdateBooking();
  const { mutate: updateApproval } = useUpdateApprovalByType();

  useEffect(() => {
    const startTime =
      getCodeByGroupAndCode("STD_TIME", "LESSON_START_TIME") || "09:00";
    const endTime =
      getCodeByGroupAndCode("STD_TIME", "LESSON_END_TIME") || "21:00";
    const timeInterval = parseInt(
      getCodeByGroupAndCode("STD_TIME", "LESSON_INTERVAL_TIME") || "60"
    );

    const startDate = new Date(`${selectedDate}T${startTime}:00`);
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
        booking_id: !book ? 0 : book?.booking_id,
      };

      timeSlots.push(timeSlot);
      // currentTime.setHours(currentTime.getHours() + timeInterval);
      currentTime.setMinutes(currentTime.getMinutes() + timeInterval);
    }

    setTimeSlots(timeSlots);
  }, [selectedDate, lesson]);

  const onBookClick = async () => {
    if (!userName || !mbrType || !selectedTimeSlot) {
      Alert.alert("Info", "Enter user name and membership type.");
      return;
    }

    if (
      !(await confirm(
        "Lesson",
        `${selectedDate} ${selectedTimeSlot.time}\nDo you want to make a reservation?`
      ))
    ) {
      setMbrType("");
      setUserName("");
      return;
    }

    const [sTime, eTime] = selectedTimeSlot.time.split(" ~ ");
    try {
      setLoading(true);
      insertBook(
        {
          branch_id: 1,
          booking_type: "lesson",
          user_id: user.user_id,
          user_name: userName,
          facility_id: 0,
          display_name: "Lesson",
          booking_dt: selectedDate,
          start_tm: sTime,
          end_tm: eTime,
          status: "BOOKED",
          member: mbrType,
          description: "Walk In",
        },
        {
          onSuccess: () => {
            Alert.alert("The reservation has been made.");
          },
        }
      );
    } catch (err) {
      console.error("Error booking lesson:", err);
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

  const onTimeClick = async (timeSlot: TimeSlot) => {
    if (timeSlot.status === "WAITING") {
      const isApproval = await confirm(
        "APPROVAL",
        "Choose Accept or Deny",
        "Accept",
        "Dney"
      );
      if (
        await confirm(
          isApproval ? "Accept" : "Cancel",
          `Would you like to ${isApproval ? "accept" : "cancel"} the lesson?`,
          "OK",
          "NO"
        )
      ) {
        try {
          setLoading(true);
          updateBook(
            {
              id: timeSlot.booking_id,
              updatedFields: {
                status: isApproval ? "BOOKED" : "CANCELED",
                booking_dt: selectedDate,
              },
            },
            {
              onSuccess: (updatedBooking) => {
                // Alert.alert(
                //   `Booking has been ${isApproval ? "accepted" : "rejected"}.`
                // );
                regApproval(updatedBooking);
              },
            }
          );
        } catch (err) {
          console.error("Error update booking:", err);
        } finally {
          setLoading(false);
        }

        return;
      } else {
        return;
      }
    }

    setSelectedTimeSlot(timeSlot);
    setIsModalVisible(true);
  };

  const regApproval = async (booking: Booking) => {
    try {
      setLoading(true);

      updateApproval(
        {
          appr_stts: booking.status === "BOOKED" ? "APPROVED" : "REJECTED",
          appr_type: "lesson",
          type_id: booking.booking_id,
          user_id: user.user_id,
        },
        {
          onSuccess: () => {
            Alert.alert(
              `Booking has been ${
                booking.status === "BOOKED" ? "accepted" : "rejected"
              }.`
            );
          },
        }
      );
    } catch (err) {
      console.error("Error approval lesson:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader headerTtitle="Golf Lesson" />
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
            <Text style={styles.possible}>Available</Text>
            <Text style={styles.impossible}>Unavailable</Text>
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
                disabled={timeSlot.selected && timeSlot.status === "BOOKED"}
              >
                <Text>{`${timeSlot.time} ${
                  timeSlot.status === "BOOKED"
                    ? ""
                    : timeSlot.status === ""
                    ? ""
                    : "(WAITING)"
                }`}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                Not available during this time.
              </Text>
              <Text style={styles.emptyText}>Please choose another date.</Text>
            </View>
          )}
        </View>
      </ScrollView>

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
      {(loading || isLoading) && <LoadingIndicator />}
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
  odalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(128,128,128,0.5)",
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

export default Lesson;
