import {
  View,
  // Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageSourcePropType,
  Alert,
} from "react-native";
import React, { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CustomHeader from "@/components/CustomHeader";
import Colors from "@/constants/Colors";
import { CalendarPicker } from "@/components/DatePicker";
import { useAuthContext } from "@/providers/AuthProvider";
import { useUpdateBooking } from "@/api/bookingStatus";
import { confirm, getFormatDate } from "@/components/commonFunc";
import LoadingIndicator from "@/components/LodingIndicator";
import { supabase } from "@/lib/supabase";
import { Tables } from "@/types";
import CustomText from "@/components/CustomText";

const Text = CustomText;

type Booking = Tables<"booking_status">;

const BookingStatus = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState<Booking[]>([]);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const onDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  useEffect(() => {
    getBookingList();
  }, [selectedDate]);

  const getBookingList = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("booking_status")
        .select("*")
        // .eq("user_id", user.user_id)
        .eq("booking_dt", getFormatDate(selectedDate))
        .in("status", ["BOOKED", "WAITING"])
        .order("facility_id", { ascending: true });
      if (error) {
        throw new Error(error.message);
      }
      setStatuses(data);
    } catch (err) {
      console.error("Error fetching booking list:", err);
    } finally {
      setLoading(false);
    }
  };

  const { mutate: updateBook } = useUpdateBooking();

  const onCancelClick = async (booking: Booking) => {
    // const currentDate = new Date();
    // const bookingDate = new Date(
    //   `${booking.booking_dt}T${booking.start_tm}:00`
    // );

    // if (bookingDate < currentDate) {
    //   Alert.alert("Cannot cancel", "You cannot cancel a past booking.");
    //   return;
    // }

    if (await confirm("Cancel", `Would you like to cancel the booking?`)) {
      updateBook(
        {
          id: booking.booking_id,
          updatedFields: {
            status: "CANCELED",
            booking_dt: booking.booking_dt,
            description: "Staff canceled",
          },
        },
        {
          onSuccess: () => {
            getBookingList();
            Alert.alert(`Booking has been canceled.`);
          },
        }
      );
    }
  };

  const renderStatusList = (bookingType: string) => {
    return (
      <ScrollView style={{ marginTop: 20 }}>
        {statuses &&
        statuses.some((status) => status.booking_type === bookingType) ? (
          statuses.map(
            (status, idx) =>
              status.booking_type === bookingType && (
                <View key={idx} style={styles.statusLine}>
                  <Text>{status.display_name}</Text>
                  <Text>{status.booking_dt}</Text>
                  <Text>{`${status.start_tm} ~ ${status.end_tm}`}</Text>
                  {status.status === "WAITING" ? (
                    <Text>Waiting</Text>
                  ) : status.status === "CANCELED" ? (
                    <Text>Canceled</Text>
                  ) : (
                    <TouchableOpacity onPress={() => onCancelClick(status)}>
                      <Text style={{ fontWeight: "600", color: Colors.blue }}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )
          )
        ) : (
          <View>
            <Text>No booking found</Text>
          </View>
        )}
      </ScrollView>
    );
  };
  const renderStatusByType = (
    bookingType: string,
    source: ImageSourcePropType,
    labelText: string
  ) => {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.label}>
          <View style={styles.title}>
            <Image
              source={source}
              resizeMode="contain"
              style={styles.labelIcon}
            />
            <Text style={styles.labelText}>{labelText}</Text>
          </View>
          {/* {bookingType !== "screen" && ( */}
          <TouchableOpacity
            style={styles.title}
            onPress={() => onBookClick(bookingType)}
          >
            <Text style={styles.labelText}>Go</Text>
            <MaterialIcons
              name="navigate-next"
              size={32}
              color={Colors.black}
            />
          </TouchableOpacity>
          {/* )} */}
        </View>
        <ScrollView>{renderStatusList(bookingType)}</ScrollView>
      </View>
    );
  };

  const onBookClick = (bookingType: string) => {
    if (bookingType === "practice") {
      router.push("/(admin)/book/practice");
    } else if (bookingType === "screen") {
      router.push("/(admin)/book/screen");
    } else if (bookingType === "lesson") {
      router.push("/(admin)/book/lesson");
    }
  };

  const onPracticeClick = () => {
    router.push("/(admin)/book/practice");
  };

  const onScreenClick = () => {
    router.push("/(admin)/book/screen");
  };

  const onLessonClick = () => {
    router.push("/(admin)/book/lesson");
  };

  return (
    <View style={styles.container}>
      <CustomHeader headerTtitle="Booking Status" />
      <CalendarPicker selectedDate={selectedDate} onDateChange={onDateChange} />
      <View style={{ marginTop: 10 }} />
      {renderStatusByType(
        "practice",
        require("@assets/images/practice.png"),
        "Practice"
      )}
      {renderStatusByType(
        "screen",
        require("@assets/images/screen.png"),
        "Screen Golf"
      )}
      {renderStatusByType(
        "lesson",
        require("@assets/images/lesson.png"),
        "Lesson"
      )}
      {loading && <LoadingIndicator />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
    justifyContent: "space-between",
  },
  label: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    flexDirection: "row",
    alignItems: "center",
  },
  labelIcon: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  labelText: {
    fontSize: 18,
    fontWeight: "600",
  },
  statusLine: {
    flexDirection: "row",
    borderBottomWidth: 1,
    justifyContent: "space-between",
    marginTop: 7,
  },
});

export default BookingStatus;
