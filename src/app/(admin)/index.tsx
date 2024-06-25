import {
  // Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import ImgBackground from "@components/ImgBackground";
import CustomButton from "@/components/CustomButton";
import { useRouter } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/providers/AuthProvider";
import { useUserMbrCnt } from "@/api/users";
import { useOrderStatusCnt } from "@/api/orders";
import LoadingIndicator from "@/components/LodingIndicator";
import { useBookingStatusCnt } from "@/api/bookingStatus";
import { useApprovalList } from "@/api/approvals";
import {
  useApprInsertSubscription,
  useApprUpdateSubscription,
  useOrderInsertSubscription,
  useOrderUpdateSubscription,
} from "@/api/subscriptions";
import CustomText from "@/components/CustomText";

const Text = CustomText;

export default function AdminHome() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const day = currentDate.getDate().toString().padStart(2, "0");
  const [today, setToay] = useState<string>(`${year}-${month}-${day}`);
  const router = useRouter();
  const { user } = useAuthContext();

  const {
    data: userCnt,
    error: umError,
    isLoading: umLoading,
  } = useUserMbrCnt();
  const {
    data: orderCnt,
    error: osError,
    isLoading: osLoading,
  } = useOrderStatusCnt();
  const {
    data: bookingCnt,
    error: bkError,
    isLoading: bkLoading,
  } = useBookingStatusCnt();
  const {
    data: approvals,
    error: apprError,
    isLoading: apprLoading,
  } = useApprovalList();

  useOrderInsertSubscription();
  useOrderUpdateSubscription();
  useApprInsertSubscription();
  useApprUpdateSubscription();

  return (
    <View style={styles.container}>
      <View style={{ marginTop: 50 }} />
      <ImgBackground />
      <View style={{ width: "100%", height: "48%" }}>
        <View style={styles.cardContainer}>
          <View style={styles.rowContainer}>
            <View style={{ flex: 1 }}>
              <View style={styles.rowContainer}>
                <View>
                  <Text>
                    <Text style={styles.welcomeText}>{user.user_name} </Text>
                    <Text style={styles.statusText}> ({user.user_type})</Text>
                  </Text>
                </View>
                <TouchableOpacity onPress={() => supabase.auth.signOut()}>
                  <Text style={styles.signOutText}>SignOut</Text>
                </TouchableOpacity>
              </View>
              {(!approvals || approvals.length > 0) && (
                <TouchableOpacity
                  onPress={() => router.push("/(admin)/manage/approvals")}
                >
                  <Text
                    style={{ marginTop: 0, color: Colors.blue }}
                  >{`You have ${approvals?.length} pending approvals.`}</Text>
                </TouchableOpacity>
              )}
            </View>
            {/* <AntDesign name="arrowright" size={20} color={Colors.black} /> */}
          </View>
          <View
            style={[styles.separator, { borderBottomColor: Colors.white }]}
          />

          <TouchableOpacity
            style={styles.rowContainer}
            onPress={() => router.push("/(admin)/mngUsers/users")}
          >
            <Text style={styles.title}>User Status</Text>
            <AntDesign name="arrowright" size={20} color={Colors.black} />
          </TouchableOpacity>
          <View>
            <Text style={styles.statusText}>
              {`All (${userCnt?.[0].all_cnt}) / Practice (${userCnt?.[0].practice_cnt}) / Lesson (${userCnt?.[0].lesson_cnt})`}
            </Text>
            <Text
              style={styles.statusText}
            >{`Guest (${userCnt?.[0].guest_cnt}) / Stopped (${userCnt?.[0].stop_cnt}) / Finish (${userCnt?.[0].finish_cnt})`}</Text>
          </View>
          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.rowContainer}
            onPress={() => router.push("/(admin)/status/booking")}
          >
            <Text style={styles.title}>Booking Status ({today})</Text>
            <AntDesign name="arrowright" size={20} color={Colors.black} />
          </TouchableOpacity>
          <View>
            <Text style={styles.statusText}>
              {`Practice (${bookingCnt?.[0].practice_cnt}) / Screen (${bookingCnt?.[0].screen_cnt}) / Lesson(${bookingCnt?.[0].lesson_cnt})`}
            </Text>
          </View>
          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.rowContainer}
            onPress={() => router.push("/(admin)/status/order")}
          >
            <Text style={styles.title}>Order Status ({today})</Text>
            <AntDesign name="arrowright" size={20} color={Colors.black} />
          </TouchableOpacity>
          <View>
            <Text style={styles.statusText}>
              {orderCnt?.[0] &&
                `unfinish (${
                  orderCnt[0].ordered + orderCnt[0].preparing
                }) / not paid (${orderCnt[0].notpaid})`}
            </Text>
            <Text style={styles.statusText}>
              {orderCnt?.[0] &&
                `finish (${orderCnt[0].completed}) / cancel (${orderCnt[0].canceled})`}
            </Text>
          </View>
        </View>
      </View>
      <View style={{ height: "2%" }} />
      <ScrollView style={{ width: "100%", height: "50%" }}>
        <CustomButton
          text="Manage Menus"
          onPress={() => router.push("/(admin)/manage/menus")}
          bgColor={Colors.white}
          fgColor={Colors.black}
          bdColor={Colors.black}
          opacityNum="0.9"
        />
        <CustomButton
          text="Manage Standard Data"
          onPress={() => router.push("/(admin)/manage/stdData")}
          bgColor={Colors.white}
          fgColor={Colors.black}
          bdColor={Colors.black}
          opacityNum="0.9"
        />
        <CustomButton
          text="Manage MemberShipt"
          onPress={() => router.push("/(admin)/manage/memberships")}
          bgColor={Colors.white}
          fgColor={Colors.black}
          bdColor={Colors.black}
          opacityNum="0.9"
        />
        <CustomButton
          text="Manage Facilities"
          onPress={() => router.push("/(admin)/manage/facilities")}
          bgColor={Colors.white}
          fgColor={Colors.black}
          bdColor={Colors.black}
          opacityNum="0.9"
        />
      </ScrollView>
      {(umLoading || osLoading || (bkLoading && apprLoading)) && (
        <LoadingIndicator />
      )}
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
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  separator: {
    width: "100%",
    marginVertical: 10,
    borderBottomWidth: 1,
    borderColor: Colors.lightgray,
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
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusText: {
    marginLeft: 10,
  },
  signOutText: {
    fontSize: 16,
    color: Colors.blue,
  },
});
