import {
  View,
  // Text,
  StyleSheet,
  FlatList,
  ListRenderItemInfo,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import Colors from "@/constants/Colors";
import CustomHeader from "@/components/CustomHeader";
import CustomButton from "@/components/CustomButton";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Tables } from "@/database.types";
import { useMembershipList } from "@/api/memberships";
import { useRouter } from "expo-router";
import LoadingIndicator from "@/components/LodingIndicator";
import CustomText from "@/components/CustomText";

const Text = CustomText;

type Membership = Tables<"memberships">;

const ManageMemberships = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: memberships, error, isLoading } = useMembershipList();

  const renderMembership = ({
    item: membership,
  }: ListRenderItemInfo<Membership>) => {
    return (
      <View style={styles.mbrContainer}>
        <View style={styles.rowContainer}>
          <Text style={{ fontSize: 14 }}>
            {`${membership.mbr_name} / ${membership.mbr_type} - ${membership.nick}`}
          </Text>

          <TouchableOpacity
            style={styles.rowContainer}
            onPress={() =>
              router.push({
                pathname: "/(admin)/manage/manageMbr",
                params: {
                  mbr_id: membership.mbr_id,
                  mbr_type: membership.mbr_type,
                  mbr_name: membership.mbr_name,
                  nick: membership.nick,
                  division: membership.division,
                  price: membership.price,
                  stop_cnt: String(membership.stop_cnt),
                  lesson_min: String(membership.lesson_min),
                  lesson_cnt: String(membership.lesson_cnt),
                  description: String(membership.description),
                },
              })
            }
          >
            <Text style={{ fontSize: 14 }}>Edit </Text>
            <AntDesign name="arrowright" size={20} color={Colors.black} />
          </TouchableOpacity>
        </View>
        <View style={styles.rowContainer}>
          <Text>{`₹ ${membership.price} Rs`}</Text>
        </View>
        {membership.mbr_type === "W/L" && (
          <View style={styles.rowContainer}>
            <Text>{`${membership.lesson_min} mins / ${membership.lesson_cnt} times`}</Text>
          </View>
        )}
        <View style={styles.rowContainer}>
          <Text>{`${membership.description}`}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader headerTtitle="Manage Memberships" />
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View style={{ flex: 9 }}>
          <FlatList
            keyboardShouldPersistTaps={"handled"}
            style={{ width: "100%" }}
            data={memberships}
            renderItem={renderMembership}
            keyExtractor={(membership) => membership.mbr_id.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={{ marginTop: 30, alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: Colors.gray }}>
                  No memberships found
                </Text>
              </View>
            )}
          />
        </View>
        <View style={{ flex: 1 }}>
          <CustomButton
            text="New Membership"
            onPress={() =>
              router.push({
                pathname: "/(admin)/manage/manageMbr",
                params: { mbr_id: -1 },
              })
            }
          />
        </View>
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
  mbrContainer: {
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
});

export default ManageMemberships;
