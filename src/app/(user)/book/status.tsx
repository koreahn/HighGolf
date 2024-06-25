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
import React, { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CustomHeader from "@/components/CustomHeader";
import Colors from "@/constants/Colors";
import { useBookingByUserList, useUpdateBooking } from "@/api/bookingStatus";
import { confirm, getFormatDate } from "@/components/commonFunc";
import { useAuthContext } from "@/providers/AuthProvider";
import LoadingIndicator from "@/components/LodingIndicator";
import { Tables } from "@/database.types";
import CustomText from "@/components/CustomText";

const Text = CustomText;

type Booking = Tables<"booking_status">;

const BookingStatus = () => {
  const router = useRouter();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const {
    data: statuses,
    error,
    isLoading,
  } = useBookingByUserList(user.user_id, getFormatDate(new Date()));

  const { mutate: updateBook } = useUpdateBooking();

  const onCancelClick = async (booking: Booking) => {
    const currentDate = new Date();
    const bookingDate = new Date(
      `${booking.booking_dt}T${booking.start_tm}:00`
    );

    if (bookingDate < currentDate) {
      Alert.alert("Cannot cancel", "이전 예약은 취소할 수 없습니다.");
      return;
    }

    if (await confirm("Cancel", `예약을 취소하시겠습니까??`)) {
      updateBook(
        {
          id: booking.booking_id,
          updatedFields: {
            status: "CANCELED",
            booking_dt: booking.booking_dt,
            description: "User canceled",
            user_id: booking.user_id,
          },
        },
        {
          onSuccess: () => {
            Alert.alert(`예약이 취소되었습니다.`);
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
                    <Text>승인대기</Text>
                  ) : status.status === "CANCELED" ? (
                    <Text>취소</Text>
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
          <View style={{ marginTop: 10, marginLeft: 10 }}>
            <Text>예약 내역이 없습니다.</Text>
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
            <Text style={styles.labelText}>예약</Text>
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
      router.push("/(user)/book/practice");
    } else if (bookingType === "screen") {
      router.push("/(user)/book/screen");
    } else if (bookingType === "lesson") {
      router.push("/(user)/book/lesson");
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader headerTtitle="예약 현황" />
      <View style={{ marginTop: 20 }} />
      {renderStatusByType(
        "practice",
        require("@assets/images/practice.png"),
        "연습 예약"
      )}
      {renderStatusByType(
        "screen",
        require("@assets/images/screen.png"),
        "스크린 예약"
      )}
      {renderStatusByType(
        "lesson",
        require("@assets/images/lesson.png"),
        "레슨 예약"
      )}
      {(loading || isLoading) && <LoadingIndicator />}
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
