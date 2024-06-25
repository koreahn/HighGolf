import {
  View,
  // Text,
  StyleSheet,
  FlatList,
  ListRenderItemInfo,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import Colors from "@/constants/Colors";
import CustomHeader from "@/components/CustomHeader";
import LoadingIndicator from "@/components/LodingIndicator";
import { useApprovalList, useUpdateApproval } from "@/api/approvals";
import { Tables } from "@/database.types";
import { confirm } from "@/components/commonFunc";
import { useUpdateUserMbr } from "@/api/userMbrs";
import { useUpdateBooking } from "@/api/bookingStatus";
import { useAuthContext } from "@/providers/AuthProvider";
import { sendPushNotificationToUser } from "@/lib/notifications";
import CustomText from "@/components/CustomText";

const Text = CustomText;

type Approval = Tables<"approvals">;

const Approvals = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const { data: approvals, error, isLoading } = useApprovalList();
  const { mutate: updateApproval } = useUpdateApproval();
  const { mutate: updateUserMbr } = useUpdateUserMbr();
  const { mutate: updateBook } = useUpdateBooking();

  const onApprClick = async (appr: Approval, type: string) => {
    if (
      !(await confirm(
        `${type === "approve" ? "Approve" : "Reject"}`,
        `Do you want to ${type === "approve" ? "approve" : "reject"} it?`
      ))
    ) {
      return;
    }

    try {
      setLoading(true);

      if (appr.appr_type === "lesson") {
        updateBook(
          {
            id: appr.type_id,
            updatedFields: {
              status: type === "approve" ? "BOOKED" : "CANCELED",
            },
          },
          {
            onSuccess: () => {
              onUpdateApproval(appr, type);
            },
          }
        );
      } else if (appr.appr_type === "stop" || appr.appr_type === "start") {
        updateUserMbr(
          {
            id: appr.type_id,
            updatedFields: {
              status:
                type === "reject"
                  ? appr.appr_type === "stop"
                    ? "NORMAL"
                    : "WAITING"
                  : type === "approve" && appr.appr_type === "stop"
                  ? "STOPPED"
                  : "NORMAL",
              stopped_cnt:
                type === "approve" && appr.appr_type === "stop" ? 1 : 0,
            },
          },
          {
            onSuccess: () => {
              onUpdateApproval(appr, type);
            },
          }
        );
      }
    } catch (err) {
      console.error("Error manage approvals (userMbr):", err);
    } finally {
      setLoading(false);
    }
  };

  const onUpdateApproval = async (appr: Approval, type: string) => {
    console.log(appr.appr_type, appr.user_id, type);
    try {
      setLoading(true);
      updateApproval(
        {
          id: appr.appr_id,
          updatedFields: {
            appr_stts: type === "approve" ? "APPROVED" : "REJECTED",
            update_id: String(user.user_id),
          },
        },
        {
          onSuccess: (updatedUserMbr) => {
            const title =
              appr.appr_type === "stop"
                ? "멤버쉽 중지"
                : appr.appr_type === "start"
                ? "멤버쉽 재시작"
                : "Lesson";
            const body =
              appr.appr_type === "stop" && type === "approve"
                ? "요청하신 멤버쉽 중지 신청이 처리되었습니다."
                : appr.appr_type === "stop" && type === "reject"
                ? "멤버쉽 중지 신청이 거절 되었습니다.\n연습장에 문의해주세요."
                : appr.appr_type === "start" && type === "approve"
                ? "요청하신 멤버쉽 재시작 신청이 처리되었습니다."
                : appr.appr_type === "start" && type === "reject"
                ? "멤버쉽 재시작 신청이 거절 되었습니다.\n연습장에 문의해주세요."
                : appr.appr_type === "lesson" && type === "approve"
                ? "요청하신 레슨이 처리되었습니다."
                : "요청하신 레슨이 거절 되었습니다.\n연습장에 문의해주세요.";
            const url =
              appr.appr_type === "lesson"
                ? "myapp://user/book/lesson"
                : "myapp://user/";
            sendPushNotificationToUser(title, body, url, appr.user_id);
            Alert.alert(
              `The ${
                type === "approve" ? "approval" : "rejection"
              } has been completed.`
            );
          },
        }
      );
    } catch (err) {
      console.error("Error manage approvals (approval):", err);
    } finally {
      setLoading(false);
    }
  };

  const renderApprovals = ({ item: appr }: ListRenderItemInfo<Approval>) => {
    return (
      <View>
        <View>
          <Text style={styles.content}>User: {appr.user_name}</Text>
          <Text style={styles.content}>
            <Text>Approval Type: </Text>
            <Text style={{ color: Colors.blue, fontWeight: "bold" }}>
              {appr.appr_type.toUpperCase()}
            </Text>
          </Text>
          {appr.appr_type === "lesson" && (
            <Text
              style={styles.content}
            >{`Date/Time: ${appr.std_dt}  ${appr.std_start_tm} ~ ${appr.std_end_tm}`}</Text>
          )}
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <View style={styles.rowContainer}>
            <TouchableOpacity
              style={{
                borderColor: Colors.gray,
                borderWidth: 1,
                borderRadius: 5,
                padding: 5,
                width: 80,
                marginTop: 10,
              }}
              onPress={() => onApprClick(appr, "approve")}
            >
              <Text style={{ textAlign: "center" }}>Approve</Text>
            </TouchableOpacity>
            <View style={{ marginHorizontal: 5 }} />
            <TouchableOpacity
              style={{
                borderColor: Colors.gray,
                borderWidth: 1,
                borderRadius: 5,
                padding: 5,
                width: 80,
                marginTop: 10,
              }}
              onPress={() => onApprClick(appr, "reject")}
            >
              <Text style={{ textAlign: "center" }}>Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.divider} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader headerTtitle="Manage Approvals" />
      <View style={{ flex: 1, marginTop: 20 }}>
        <FlatList
          keyboardShouldPersistTaps={"handled"}
          style={{ width: "100%" }}
          data={approvals}
          renderItem={renderApprovals}
          keyExtractor={(appr) => appr.appr_id.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={{ marginTop: 30, alignItems: "center" }}>
              <Text style={{ fontSize: 16, color: Colors.gray }}>
                No Approvals found
              </Text>
            </View>
          )}
        />
      </View>
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
  apprContainer: {
    borderWidth: 1,
    borderColor: Colors.gray,
    marginVertical: 10,
    padding: 10,
    borderRadius: 10,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "space-between",
  },
  divider: {
    width: "100%",
    marginTop: 10,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: Colors.lightgray,
  },
  content: {
    marginBottom: 5,
  },
});

export default Approvals;
