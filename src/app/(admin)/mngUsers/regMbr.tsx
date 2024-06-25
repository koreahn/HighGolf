import {
  View,
  // Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  // TextInput,
} from "react-native";
import React, { useState } from "react";
import Colors from "@/constants/Colors";
import CustomHeader from "@/components/CustomHeader";
import CustomButton from "@/components/CustomButton";
import { addDate, getFormatDate } from "@/components/commonFunc";
import { AntDesign } from "@expo/vector-icons";
import { Tables } from "@/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import LoadingIndicator from "@/components/LodingIndicator";
import {
  CustomInputA,
  CustomInputB,
  CustomSelectDropdown,
} from "@/components/CustomInput";
import SelectDropdown from "react-native-select-dropdown";
import { useMembershipList } from "@/api/memberships";
import { useForm } from "react-hook-form";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useInsertUserMbr } from "@/api/userMbrs";
import { useUpdateUser } from "@/api/users";
import CustomText from "@/components/CustomText";
import CustomTextInput from "@/components/\bCustomTextInput";

const Text = CustomText;
const TextInput = CustomTextInput;

type UserMbrs = Tables<"user_mbrs">;
type Membership = Tables<"memberships">;

const RegMbr = () => {
  const [loading, setLoading] = useState(false);
  const [selectedMbr, setSelectedMbr] = useState<Membership>();
  const router = useRouter();
  const { user_id: idString } = useLocalSearchParams();
  const user_id =
    idString === undefined
      ? 0
      : parseFloat(typeof idString === "string" ? idString : idString?.[0]);

  const { data: memberships, error, isLoading } = useMembershipList();
  const mbrs = memberships
    ? memberships.map((item) => ({
        title: `${item.mbr_name} - ${item.mbr_type}`,
        mbr_id: item.mbr_id,
      }))
    : [];

  const onSelect = (data: Membership) => {
    const mbr = memberships?.find((item) => item.mbr_id === data.mbr_id);
    setSelectedMbr(mbr);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
  } = useForm<UserMbrs>({
    defaultValues: {},
  });

  const [showJoinPicker, setShowJoinPicker] = useState(false);
  const [showPmtPicker, setShowPmtPicker] = useState(false);
  const [joinDt, setJoinDt] = useState(getFormatDate(new Date()));
  const [pmtDt, setPmtDt] = useState(getFormatDate(new Date()));
  const [desc, setDesc] = useState("");

  const toggleJoinDatePicker = () => {
    setShowJoinPicker((prev) => !prev);
  };
  const togglePmtDatePicker = () => {
    setShowPmtPicker((prev) => !prev);
  };

  const { mutate: insertUserMbr } = useInsertUserMbr();
  const { mutate: updateUser } = useUpdateUser();

  const onRegisterClick = (formData: UserMbrs) => {
    if (selectedMbr) {
      insertUserMbr(
        {
          branch_id: 1,
          user_id: user_id,
          mbr_id: selectedMbr.mbr_id,
          mbr_type: selectedMbr.mbr_type,
          mbr_name: selectedMbr.mbr_name,
          nick: selectedMbr.nick,
          division: selectedMbr.division,
          status: "NORMAL",
          pmt_amt: formData.pmt_amt,
          pmt_dt: pmtDt,
          pending_amt: formData.pending_amt,
          pmt_mthd: formData.pmt_mthd,
          join_dt: joinDt,
          finish_dt: addDate(
            joinDt,
            "month",
            parseInt((selectedMbr?.nick).replace(/\D/g, ""))
          ),
          stop_cnt: selectedMbr.stop_cnt,
          stopped_cnt: 0,
          stop_desc: "",
        },
        {
          onSuccess: () => {
            Alert.alert("User Membership has been saved.");
            if (desc) {
              updateUserDesc(desc);
            } else {
              router.push("/(admin)/mngUsers/users");
            }
          },
        }
      );
    } else {
      Alert.alert("Select Membership.");
    }
  };

  const updateUserDesc = (desc: string) => {
    updateUser(
      {
        id: user_id,
        updatedFields: {
          description: desc,
        },
      },
      {
        onSuccess: () => {
          router.push("/(admin)/mngUsers/users");
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader headerTtitle="Register Membership" />
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View style={{ flex: 9 }}>
          <View style={styles.rowContainer}>
            <Text style={{ width: "35%" }}>Memberships: </Text>
            <SelectDropdown
              data={mbrs}
              onSelect={onSelect}
              defaultValue={"ALL"}
              renderButton={(selectedItem, isOpened) => {
                return (
                  <View
                    style={{
                      flexDirection: "row",
                      width: "65%",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderColor: Colors.light.tint,
                      borderWidth: 1,
                      height: 30,
                      borderRadius: 5,
                      paddingHorizontal: 10,
                    }}
                  >
                    <Text style={{ fontSize: 12 }}>
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
                      width: "100%",
                      flexDirection: "row",
                      paddingHorizontal: 12,
                      justifyContent: "center",
                      alignItems: "center",
                      paddingVertical: 8,
                      ...(isSelected && { backgroundColor: "#D2D9DF" }),
                    }}
                  >
                    <Text
                      style={{ flex: 1, fontSize: 14, color: Colors.black }}
                    >
                      {item.title}
                    </Text>
                  </View>
                );
              }}
              showsVerticalScrollIndicator={false}
              dropdownStyle={{ borderRadius: 8 }}
            />
          </View>
          <View
            style={{
              marginTop: 15,
              borderColor: Colors.lightgray,
              borderWidth: 1,
              borderRadius: 10,
              padding: 20,
              height: "90%",
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <CustomInputB label="Name" value={selectedMbr?.mbr_name} />
              <CustomInputB label="Type" value={selectedMbr?.mbr_type} />
              <CustomInputB
                label="Disp. Name"
                value={selectedMbr?.description}
              />
              <CustomInputB label="Price (₹)" value={selectedMbr?.price} />
              <CustomInputB
                label="Lesson mins"
                value={selectedMbr?.lesson_min}
              />
              <CustomInputB
                label="Lesson cnt"
                value={selectedMbr?.lesson_cnt}
              />

              <View style={styles.divider} />

              <View
                style={[
                  styles.rowContainer,
                  { justifyContent: "space-between", marginBottom: 10 },
                ]}
              >
                <Text style={styles.aText}>Join Date: </Text>
                <TouchableOpacity
                  style={styles.aInput}
                  onPress={toggleJoinDatePicker}
                >
                  <Text style={{ textAlign: "left" }}>{joinDt}</Text>
                  <DateTimePickerModal
                    isVisible={showJoinPicker}
                    mode="date"
                    onConfirm={(date) => {
                      setJoinDt(getFormatDate(date));
                      toggleJoinDatePicker();
                    }}
                    onCancel={toggleJoinDatePicker}
                    minuteInterval={10}
                    date={joinDt ? new Date(joinDt) : new Date()}
                  />
                </TouchableOpacity>
              </View>
              <CustomInputB
                label="Finish Date"
                value={
                  selectedMbr?.nick
                    ? addDate(
                        joinDt,
                        "month",
                        parseInt((selectedMbr?.nick).replace(/\D/g, ""))
                      )
                    : ""
                }
              />
              <View
                style={[
                  styles.rowContainer,
                  { justifyContent: "space-between", marginBottom: 10 },
                ]}
              >
                <Text style={styles.aText}>Pay Date: </Text>
                <TouchableOpacity
                  style={styles.aInput}
                  onPress={togglePmtDatePicker}
                >
                  <Text style={{ textAlign: "left" }}>{pmtDt}</Text>
                  <DateTimePickerModal
                    isVisible={showPmtPicker}
                    mode="date"
                    onConfirm={(date) => {
                      setPmtDt(getFormatDate(date));
                      togglePmtDatePicker();
                    }}
                    onCancel={togglePmtDatePicker}
                    minuteInterval={10}
                    date={pmtDt ? new Date(pmtDt) : new Date()}
                  />
                </TouchableOpacity>
              </View>
              <CustomSelectDropdown
                data={[
                  { title: "CARD" },
                  { title: "UPI" },
                  { title: "BANK" },
                  { title: "CASH" },
                ]}
                control={control}
                label="Pay Method"
                name="pmt_mthd"
                rules={{
                  required: "Pay Method is required",
                }}
              />
              <CustomInputA
                control={control}
                label="Pay Amount"
                name="pmt_amt"
                placeholder="Enter pay amount"
                rules={{
                  required: "Amount is required",
                  pattern: {
                    value: /^\d+$/,
                    message: "Please enter a number for Amount.",
                  },
                }}
              />
              <CustomInputA
                control={control}
                label="Pending"
                name="pending_amt"
                placeholder="Enter pendig amount"
                rules={{
                  // required: "Amount is required",
                  pattern: {
                    value: /^\d+$/,
                    message: "Please enter a number for Amount.",
                  },
                }}
              />
              <View
                style={[
                  styles.rowContainer,
                  { justifyContent: "space-between" },
                ]}
              >
                <Text style={styles.aText}>Description: </Text>
                <TextInput
                  style={styles.aInput}
                  value={desc}
                  placeholderTextColor={Colors.gray}
                  onChangeText={setDesc}
                  placeholder="Enter Description"
                  returnKeyType="done"
                />
              </View>
            </ScrollView>
          </View>
        </View>
        <View style={{ flex: 1 }}>
          <CustomButton
            text="Register Membership"
            onPress={handleSubmit(onRegisterClick)}
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
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    width: "100%",
    marginTop: 10,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderColor: Colors.lightgray,
  },
  aText: {
    width: "35%",
  },
  aInput: {
    color: Colors.black,
    borderColor: Colors.light.tint,
    borderWidth: 1,
    height: 30,
    width: "65%",
    borderRadius: 5,
    padding: 5,
    paddingHorizontal: 10,
  },
});
export default RegMbr;
