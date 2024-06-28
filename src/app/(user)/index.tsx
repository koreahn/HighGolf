import {
  // Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  BackHandler,
} from "react-native";
import ImgBackground from "@components/ImgBackground";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useAuthContext } from "@/providers/AuthProvider";
import { useUserBookingStatusCnt } from "@/api/bookingStatus";
import LoadingIndicator from "@/components/LodingIndicator";
import { useEffect, useState } from "react";
import { confirm, getFormatDate } from "@/components/commonFunc";
import { useUpdateUserMbr } from "@/api/userMbrs";
import { useInsertApproval } from "@/api/approvals";
import { Tables } from "@/database.types";
import { useOrderStatusCntByUser } from "@/api/orders";
import {
  useApprUpdateSubscription,
  useOrderInsertSubscription,
  useOrderUpdateSubscription,
} from "@/api/subscriptions";
import { sendPushNotificationToUser } from "@/lib/notifications";
import CustomText from "@/components/CustomText";
import { useIsFocused } from "@react-navigation/native";

const Text = CustomText;

type UserMbr = Tables<"user_mbrs">;

export default function UserHome() {
  const isFocused = useIsFocused();

  useEffect(() => {
    const backAction = () => {
      if (isFocused) {
        BackHandler.exitApp();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, [isFocused]);

  const router = useRouter();
  const { user, fetchUser } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const {
    data: bookingCnt,
    error: bkError,
    isLoading: bkLoading,
  } = useUserBookingStatusCnt(user.user_id);

  const {
    data: orderCnt,
    error: orderError,
    isLoading: orderLoading,
  } = useOrderStatusCntByUser(user.user_id);

  const { mutate: updateUserMbr } = useUpdateUserMbr();
  const { mutate: insertApproval } = useInsertApproval();

  const onStopStartClick = async (type: string) => {
    if (
      !(await confirm(
        "Membership",
        `Do you want to ${type === "stop" ? "suspend" : "restart"}?`
      ))
    ) {
      return;
    }

    try {
      setLoading(true);

      updateUserMbr(
        {
          id: user.user_mbrs_id,
          updatedFields: {
            status: "WAITING",
          },
        },
        {
          onSuccess: (updatedUserMbr) => {
            // Alert.alert(
            //   `${type === "stop" ? "일시 중지" : "다시 시작"} 가 신청되었습니다.`
            // );
            onInsertApproval(updatedUserMbr, type);
          },
        }
      );
    } catch (err) {
      console.error(`Error mbr ${type}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const onInsertApproval = async (updatedUserMbr: UserMbr, type: string) => {
    try {
      setLoading(true);

      insertApproval(
        {
          branch_id: 1,
          appr_type: type,
          type_id: updatedUserMbr.user_mbrs_id,
          user_id: user.user_id,
          user_name: user.user_name,
          appr_stts: "PROGRESS",
          appr_dt: getFormatDate(new Date()),
          create_id: String(user.user_id),
        },
        {
          onSuccess: () => {
            fetchUser();

            const title =
              type === "stop" ? "Stop Membership" : "Start Membership";
            const body =
              type === "stop"
                ? "User has applied for membership suspension."
                : "User has applied for membership reactivation.";
            sendPushNotificationToUser(
              title,
              body,
              "myapp://admin/manage/approvals"
            );
            Alert.alert(
              "Membership",
              `${
                type === "stop" ? "Membership suspension" : "Membership restart"
              } has been requested.`
            );
            // router.push("/(user)/");
          },
        }
      );
    } catch (err) {
      console.error("Error insert approval:", err);
    } finally {
      setLoading(false);
    }
  };

  useOrderInsertSubscription();
  useOrderUpdateSubscription();
  useApprUpdateSubscription();

  return (
    <View style={styles.container}>
      <View style={{ marginTop: 50 }} />
      <ImgBackground />
      <View style={{ width: "100%", height: "45%" }}>
        <View style={styles.cardContainer}>
          <View style={{ flex: 0.6 }}>
            <Text>
              <Text>Hello, </Text>
              <Text style={styles.welcomeText}>{`${user.user_name}`}</Text>
            </Text>
          </View>
          <View style={{ flex: 1.4, gap: 10 }}>
            <Text>
              {user.mbr_type
                ? `You are ${user.mbr_name} Member.`
                : `You are a Welcome Guest.`}
            </Text>
            {user.mbr_type && (
              <Text>{`Preod: ${user.join_dt} ~ ${user.finish_dt}`}</Text>
            )}
            {user.mbr_type && (
              <Text>
                <Text>Membership Status: </Text>
                <Text
                  style={{
                    color:
                      user.status === "FINISH" || user.status === "STOPPED"
                        ? Colors.red
                        : Colors.black,
                  }}
                >
                  {/* {user.status === "WAITING"
                    ? "승인대기 중"
                    : user.status === "FINISH"
                    ? "종료"
                    : user.status === "STOPPED"
                    ? "중지"
                    : "정상"} */}
                  {user.status}
                </Text>
              </Text>
            )}
            {/* {user.mbr_type && user.status === "NORMAL" ? () : ()} */}
            {user.status !== "WAITING" &&
              user.status !== "FINISH" &&
              user.status !== "STOPPED" &&
              user.stop_cnt > 0 &&
              user.stop_cnt > user.stopped_cnt && (
                <View style={{ alignItems: "flex-end" }}>
                  <TouchableOpacity
                    style={{
                      borderColor: Colors.gray,
                      borderWidth: 1,
                      borderRadius: 5,
                      padding: 5,
                      width: 100,
                      marginTop: -30,
                    }}
                    onPress={() => onStopStartClick("stop")}
                  >
                    <Text style={{ textAlign: "center" }}>Stop</Text>
                  </TouchableOpacity>
                </View>
              )}
            {/* {user.status === "STOPPED" && (
              <View style={{ alignItems: "flex-end" }}>
                <TouchableOpacity
                  style={{
                    borderColor: Colors.gray,
                    borderWidth: 1,
                    borderRadius: 5,
                    padding: 5,
                    width: 100,
                    marginTop: 10,
                  }}
                  onPress={() => onStopStartClick("start")}
                >
                  <Text style={{ textAlign: "center" }}>Start</Text>
                </TouchableOpacity>
              </View>
            )} */}
          </View>
          <View style={{ flex: 0.8 }}>
            <TouchableOpacity
              style={{
                flex: 1,
              }}
              onPress={() => router.push("/(user)/book/status")}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  Booking Status{"  "}
                </Text>
                <AntDesign name="arrowright" size={20} color={Colors.black} />
              </View>
              <Text>{`Practice (${bookingCnt?.[0].practice_cnt}) / Screen (${bookingCnt?.[0].screen_cnt}) / Lesson (${bookingCnt?.[0].lesson_cnt})`}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 0.8 }}>
            <TouchableOpacity
              style={{
                flex: 1,
              }}
              onPress={() => router.push("/(user)/food/orderStatus")}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  Order Status{"  "}
                </Text>
                <AntDesign name="arrowright" size={20} color={Colors.black} />
              </View>
              <Text>{`Ordered (${orderCnt?.[0].ordered}) / Preparing (${orderCnt?.[0].preparing}) / Not Paid (${orderCnt?.[0].notpaid}) / Canceled (${orderCnt?.[0].canceled})`}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/account")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Text style={{ color: Colors.blue, fontWeight: "bold" }}>
              Edit Profile{" "}
            </Text>
            <AntDesign name="arrowright" size={18} color={Colors.blue} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ height: "5%" }} />
      <ScrollView style={{ width: "100%", height: "50%" }}>
        <CustomButton
          text="Book Practice"
          onPress={() => router.push("/(user)/book/practice")}
          bgColor={Colors.white}
          fgColor={Colors.black}
          bdColor={Colors.black}
          opacityNum="0.9"
        />
        <CustomButton
          text="Book Screen Golf"
          onPress={() => router.push("/(user)/book/screen")}
          bgColor={Colors.white}
          fgColor={Colors.black}
          bdColor={Colors.black}
          opacityNum="0.9"
        />
        <CustomButton
          text="Book Lesson"
          onPress={() => router.push("/(user)/book/lesson")}
          bgColor={Colors.white}
          fgColor={Colors.black}
          bdColor={Colors.black}
          opacityNum="0.9"
        />
        <CustomButton
          text="Order Beverages & Snacks"
          onPress={() => router.push("/(user)/food/order")}
          bgColor={Colors.white}
          fgColor={Colors.black}
          bdColor={Colors.black}
          opacityNum="0.9"
        />
      </ScrollView>
      {loading || ((bkLoading || orderLoading) && <LoadingIndicator />)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "90%",
  },
  cardContainer: {
    width: "100%",
    height: "100%",
    padding: 10,
    backgroundColor: Colors.white,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
    opacity: 0.9,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
