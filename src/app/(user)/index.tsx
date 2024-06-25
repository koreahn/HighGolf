import {
  // Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import ImgBackground from "@components/ImgBackground";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useAuthContext } from "@/providers/AuthProvider";
import { useUserBookingStatusCnt } from "@/api/bookingStatus";
import LoadingIndicator from "@/components/LodingIndicator";
import { useState } from "react";
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

const Text = CustomText;

type UserMbr = Tables<"user_mbrs">;

export default function UserHome() {
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
        "멤버쉽",
        `멤버쉽을 ${type === "stop" ? "일시 중지" : "다시 시작"} 하시겠습니까?`
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
              `${
                type === "stop" ? "일시 중지" : "다시 시작"
              } 가 신청되었습니다.`
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
              <Text style={styles.welcomeText}>{`${user.user_name} 님`}</Text>
              <Text>, 반갑습니다.</Text>
            </Text>
          </View>
          <View style={{ flex: 1.4, gap: 10 }}>
            <Text>
              {user.mbr_type
                ? `회원님은 현재 ${user.mbr_desc} 이용 중 입니다.`
                : `회원님은 현재 Welcome Guest 입니다.`}
            </Text>
            {user.mbr_type && (
              <Text>{`기긴: ${user.join_dt} ~ ${user.finish_dt}`}</Text>
            )}
            {user.mbr_type && (
              <Text>
                <Text>멤버쉽 상태: </Text>
                <Text
                  style={{
                    color:
                      user.status === "FINISH" || user.status === "STOPPED"
                        ? Colors.red
                        : Colors.black,
                  }}
                >
                  {user.status === "WAITING"
                    ? "승인대기 중"
                    : user.status === "FINISH"
                    ? "종료"
                    : user.status === "STOPPED"
                    ? "중지"
                    : "정상"}
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
            {user.status === "STOPPED" && (
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
            )}
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
                  예약현황{"  "}
                </Text>
                <AntDesign name="arrowright" size={20} color={Colors.black} />
              </View>
              <Text>{`연습 예약 (${bookingCnt?.[0].practice_cnt}) / 스크린 예약 (${bookingCnt?.[0].screen_cnt}) / 레슨 예약 (${bookingCnt?.[0].lesson_cnt})`}</Text>
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
                  주문현황{"  "}
                </Text>
                <AntDesign name="arrowright" size={20} color={Colors.black} />
              </View>
              <Text>{`주문 (${orderCnt?.[0].ordered}) / 준비중 (${orderCnt?.[0].preparing}) / 지불필요 (${orderCnt?.[0].notpaid}) / 취소 (${orderCnt?.[0].canceled})`}</Text>
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
              개인정보 수정{" "}
            </Text>
            <AntDesign name="arrowright" size={18} color={Colors.blue} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ height: "5%" }} />
      <ScrollView style={{ width: "100%", height: "50%" }}>
        <CustomButton
          text="연습 예약"
          onPress={() => router.push("/(user)/book/practice")}
          bgColor={Colors.white}
          fgColor={Colors.black}
          bdColor={Colors.black}
          opacityNum="0.9"
        />
        <CustomButton
          text="스크린 골프 예약"
          onPress={() => router.push("/(user)/book/screen")}
          bgColor={Colors.white}
          fgColor={Colors.black}
          bdColor={Colors.black}
          opacityNum="0.9"
        />
        <CustomButton
          text="골프레슨 예약"
          onPress={() => router.push("/(user)/book/lesson")}
          bgColor={Colors.white}
          fgColor={Colors.black}
          bdColor={Colors.black}
          opacityNum="0.9"
        />
        <CustomButton
          text="음료 & 스낵 주문"
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
