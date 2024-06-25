import {
  View,
  // Text,
  StyleSheet,
  FlatList,
  // TextInput,
  ListRenderItem,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import CustomHeader from "@/components/CustomHeader";
import Colors from "@/constants/Colors";
import {
  Ionicons,
  AntDesign,
  MaterialCommunityIcons,
  SimpleLineIcons,
  Fontisto,
} from "@expo/vector-icons";
import SelectDropdown from "react-native-select-dropdown";
import { Functions } from "@/types";
import { useRouter } from "expo-router";
import LoadingIndicator from "@/components/LodingIndicator";
import { useUsersWithMbr } from "@/api/users";
import { useMembershipList } from "@/api/memberships";
import { supabase } from "@/lib/supabase";
import CustomText from "@/components/CustomText";
import CustomTextInput from "@/components/\bCustomTextInput";

const Text = CustomText;
const TextInput = CustomTextInput;

type UsersWithMbr = Functions<"get_users_and_latest_membership">;
type UserWithMbr = UsersWithMbr[0];

const Users = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // const { data: users, error, isLoading, refetch } = useUsersWithMbr();

  useEffect(() => {
    getUsersWithMbr();
  }, []);

  const [users, setUsers] = useState<UsersWithMbr>([]);
  const [filteredUsers, setFilteredUsers] = useState<UsersWithMbr>([]);

  const getUsersWithMbr = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc(
      "get_users_and_latest_membership"
    );
    if (error) {
      console.error("Error users getUsersWithMbr", error);
    } else {
      setUsers(data);
    }
    setLoading(false);
  };

  const [searchText, setSearchText] = useState<string>("");
  const [searchMbrType, setSearchMbrType] = useState<string>("");
  const [isPending, setIsPending] = useState<boolean>(false);
  const [isStop, setIsStop] = useState<boolean>(false);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [isUser, setIsUser] = useState<boolean>(false);

  useEffect(() => {
    filterUsers();
  }, [searchText, searchMbrType, isPending, isStop, isStaff, isUser, users]);

  const filterUsers = () => {
    if (!users) return;
    const filteredUsers = users?.filter((user) => {
      const userName = user.user_name ? user.user_name.toLowerCase() : "";
      const searchName = searchText.toLowerCase();
      // const mbrType = user.mbr_type?.toLowerCase();
      const mbrType = user.mbr_id ? String(user.mbr_id) : "";
      const pendingAmt = user.pending_amt;
      const stopDt = user.stop_dt;
      const status = user.status;
      const userType = user.user_type;

      const condition1 = userName.includes(searchName);
      const condition2 =
        searchMbrType.toLowerCase() === "all" ||
        searchMbrType.toLowerCase() === "" ||
        mbrType === searchMbrType.toLowerCase();

      const condition3 = isPending ? pendingAmt > 0 : true;
      // const condition4 = isStop ? stopDt && stopDt !== "" : true;
      const condition4 = isStop ? status === "STOPPED" : true;
      const condition5 = isStaff ? userType !== "USER" : true;
      const condition6 = isUser ? userType === "USER" : true;

      return (
        condition1 &&
        condition2 &&
        condition3 &&
        condition4 &&
        condition5 &&
        condition6
      );
    });

    setFilteredUsers(filteredUsers);
  };

  const { data: memberships } = useMembershipList();
  const mbrTypes = !memberships
    ? []
    : memberships?.map((item) => ({
        title: item.nick + "-" + item.mbr_type,
        value: String(item.mbr_id),
      }));
  mbrTypes?.unshift({ title: "ALL", value: "" });

  const renderUsers: ListRenderItem<UserWithMbr> = ({ item }) => {
    return (
      <View style={styles.userContainer}>
        <View
          style={[styles.rowContainer, { justifyContent: "space-between" }]}
        >
          <View style={styles.rowContainer}>
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={20}
              color={Colors.black}
              style={styles.icon}
            />
            <Text style={styles.nameText}>{item.user_name}</Text>
            <Text style={styles.subText}> ({item.user_type})</Text>
          </View>
          <TouchableOpacity
            style={styles.rowContainer}
            onPress={() =>
              router.push({
                pathname: "/(admin)/mngUsers/manageUser",
                params: {
                  user_id: item.user_id,
                  user_type: item.user_type,
                  user_name: item.user_name,
                  contact: item.contact,
                  user_mbrs_id: item.user_mbrs_id,
                  mbr_type: item.mbr_type,
                  mbr_name: item.mbr_name,
                  nick: item.nick,
                  division: item.division,
                  status: item.status,
                  pmt_amt: item.pmt_amt,
                  pending_amt: item.pending_amt,
                  pmt_dt: item.pmt_dt,
                  pmt_mthd: item.pmt_mthd,
                  join_dt: item.join_dt,
                  finish_dt: item.finish_dt,
                  stop_cnt: item.stop_cnt,
                  stopped_cnt: item.stopped_cnt,
                  stop_desc: item.stop_desc,
                  stop_dt: item.stop_dt,
                  start_dt: item.start_dt,
                  description: item.description,
                },
              })
            }
          >
            <Text>Edit </Text>
            <AntDesign name="arrowright" size={20} color={Colors.black} />
          </TouchableOpacity>
        </View>
        <View style={styles.rowContainer}>
          <MaterialCommunityIcons
            name="card-account-phone-outline"
            size={18}
            color={Colors.black}
            style={styles.icon}
          />
          <Text style={styles.subText}>Contact: {item.contact}</Text>
        </View>
        {item.mbr_name && item.mbr_name !== "" && (
          <View style={styles.rowContainer}>
            <MaterialCommunityIcons
              name="ticket-outline"
              size={18}
              color={Colors.black}
              style={styles.icon}
            />
            <Text style={styles.subText}>
              Membership: {item.mbr_name} ({item.mbr_type})
            </Text>
          </View>
        )}
        {item.join_dt && item.join_dt !== "" && (
          <View style={styles.rowContainer}>
            <AntDesign
              name="calendar"
              size={18}
              color={Colors.black}
              style={styles.icon}
            />
            <Text style={styles.subText}>
              Term: {`${item.join_dt} ~ ${item.finish_dt}`}
            </Text>
          </View>
        )}
        {item.stop_dt && item.stop_dt !== "" && (
          <View style={styles.rowContainer}>
            <MaterialCommunityIcons
              name="calendar-remove-outline"
              size={18}
              color={Colors.black}
              style={styles.icon}
            />
            <Text
              style={[
                styles.subText,
                { color: Colors.red, fontWeight: "bold" },
              ]}
            >
              Stop Date: {item.stop_dt}
            </Text>
          </View>
        )}
        {item.pending_amt > 0 && (
          <View style={styles.rowContainer}>
            <AntDesign
              name="warning"
              size={18}
              color={Colors.red}
              style={styles.icon}
            />
            <Text
              style={[
                styles.subText,
                { color: Colors.red, fontWeight: "bold" },
              ]}
            >
              Pending: {`₹ ${item.pending_amt}`}
            </Text>
          </View>
        )}
        {item.description && item.description !== "" && (
          <>
            <View style={styles.rowContainer}>
              <SimpleLineIcons
                name="notebook"
                size={18}
                color={Colors.black}
                style={styles.icon}
              />
              <Text style={styles.subText}>Remark: </Text>
            </View>
            <Text style={styles.subText}>{item.description}</Text>
          </>
        )}
      </View>
    );
  };

  const onSelect = (item: { title: string; value: string }) => {
    setSearchMbrType(item.value);
  };

  return (
    <View style={styles.container}>
      <CustomHeader headerTtitle="Manage Users" path="/" />
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color={Colors.lightgray}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholder="Name Search"
          placeholderTextColor={Colors.lightgray}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.rowContainer,
            { justifyContent: "space-between", gap: 10, marginBottom: 0 },
          ]}
        >
          <View style={[styles.searchContainer, { width: 120, height: 35 }]}>
            <SelectDropdown
              data={mbrTypes}
              onSelect={onSelect}
              defaultValue={"ALL"}
              renderButton={(selectedItem, isOpened) => {
                return (
                  <View style={styles.dropdownButtonStyle}>
                    <Text style={styles.subText}>
                      {selectedItem ? selectedItem.title : "ALL"}
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
          <View style={[styles.searchContainer, { height: 35 }]}>
            <TouchableOpacity
              style={[styles.rowContainer, { marginBottom: 0 }]}
              onPress={() => setIsPending((prev) => !prev)}
            >
              <Fontisto
                name={isPending ? "checkbox-active" : "checkbox-passive"}
                size={12}
                color={Colors.black}
                style={styles.icon}
              />
              <Text style={styles.subText}>Pending</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.searchContainer, { height: 35 }]}>
            <TouchableOpacity
              style={[styles.rowContainer, { marginBottom: 0 }]}
              onPress={() => setIsStop((prev) => !prev)}
            >
              <Fontisto
                name={isStop ? "checkbox-active" : "checkbox-passive"}
                size={12}
                color={Colors.black}
                style={styles.icon}
              />
              <Text style={styles.subText}>Stop</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.searchContainer, { height: 35 }]}>
            <TouchableOpacity
              style={[styles.rowContainer, { marginBottom: 0 }]}
              onPress={() => setIsUser((prev) => !prev)}
            >
              <Fontisto
                name={isUser ? "checkbox-active" : "checkbox-passive"}
                size={12}
                color={Colors.black}
                style={styles.icon}
              />
              <Text style={styles.subText}>User</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.searchContainer, { height: 35 }]}>
            <TouchableOpacity
              style={[styles.rowContainer, { marginBottom: 0 }]}
              onPress={() => setIsStaff((prev) => !prev)}
            >
              <Fontisto
                name={isStaff ? "checkbox-active" : "checkbox-passive"}
                size={12}
                color={Colors.black}
                style={styles.icon}
              />
              <Text style={styles.subText}>Staff</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
      <View style={{ marginVertical: 5 }} />
      <View style={{ height: "70%" }}>
        <FlatList
          keyboardShouldPersistTaps={"handled"}
          style={{ width: "100%" }}
          data={filteredUsers}
          renderItem={renderUsers}
          keyExtractor={(user) => user.user_id.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={{ marginTop: 30, alignItems: "center" }}>
              <Text style={{ fontSize: 16, color: Colors.gray }}>
                No users found
              </Text>
            </View>
          )}
        />
      </View>
      {loading && <LoadingIndicator />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginTop: 10,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightgray,
    paddingVertical: 8,
  },
  userContainer: {
    borderWidth: 1,
    borderColor: Colors.gray,
    marginVertical: 10,
    padding: 10,
    borderRadius: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
  },
  icon: {
    marginRight: 8,
  },
  separator: {
    width: "100%",
    marginVertical: 10,
    borderBottomWidth: 1,
    borderColor: Colors.lightgray,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  subText: {
    fontSize: 12,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  dropdownButtonStyle: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 30,
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

export default Users;
