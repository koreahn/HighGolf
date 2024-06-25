import {
  View,
  StyleSheet,
  ScrollView,
  // Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import Colors from "@/constants/Colors";
import CustomHeader from "@/components/CustomHeader";
import CustomButton from "@/components/CustomButton";
import { useForm } from "react-hook-form";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Functions } from "@/types";
import {
  CustomInputA,
  CustomInputB,
  CustomSelectDropdown,
} from "@/components/CustomInput";
import { AntDesign } from "@expo/vector-icons";
import LoadingIndicator from "@/components/LodingIndicator";
import { useAuthContext } from "@/providers/AuthProvider";
import { useUpdateUser } from "@/api/users";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import {
  getFormatDate,
  confirm,
  daysDifference,
  addDaysToDate,
} from "@/components/commonFunc";
import { useUpdateUserMbr } from "@/api/userMbrs";
import CustomText from "@/components/CustomText";

const Text = CustomText;

type UsersWithMbr = Functions<"get_user_and_latest_membership">;
type UserWithMbr = UsersWithMbr[0];

const ManageUser = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { isAdmin, user } = useAuthContext();
  const { mutate: updateUser } = useUpdateUser();
  const { mutate: updateUserMbr } = useUpdateUserMbr();

  const {
    user_id: idString,
    user_type: user_type,
    user_name: user_name,
    contact: contact,
    user_mbrs_id: umiString,
    mbr_type: mbr_type,
    mbr_name: mbr_name,
    nick: nick,
    division: division,
    status: status,
    pmt_amt: pmtAmtString,
    pending_amt: pendingAmtString,
    pmt_dt: pmt_dt,
    pmt_mthd: pmt_mthd,
    join_dt: join_dt,
    finish_dt: finish_dt,
    stop_cnt: stopCntString,
    stopped_cnt: stoppedCntString,
    stop_desc: stop_desc,
    stop_dt: stop_dt,
    start_dt: start_dt,
    description: description,
  } = useLocalSearchParams();
  const user_id =
    idString === undefined
      ? 0
      : parseFloat(typeof idString === "string" ? idString : idString?.[0]);
  const user_mbrs_id =
    umiString === undefined
      ? 0
      : parseFloat(typeof umiString === "string" ? umiString : umiString?.[0]);
  const pmt_amt =
    pmtAmtString === undefined
      ? 0
      : parseFloat(
          typeof pmtAmtString === "string" ? pmtAmtString : pmtAmtString?.[0]
        );
  const pending_amt =
    pendingAmtString === undefined
      ? 0
      : parseFloat(
          typeof pendingAmtString === "string"
            ? pendingAmtString
            : pendingAmtString?.[0]
        );
  const stop_cnt =
    stopCntString === undefined
      ? 0
      : parseFloat(
          typeof stopCntString === "string" ? stopCntString : stopCntString?.[0]
        );
  const stopped_cnt =
    stoppedCntString === undefined
      ? 0
      : parseFloat(
          typeof stoppedCntString === "string"
            ? stoppedCntString
            : stoppedCntString?.[0]
        );

  const [pmtDt, setPmtDt] = useState<string>(String(pmt_dt));
  const [showPmtPicker, setShowPmtPicker] = useState(false);
  const togglePmtDatePicker = () => {
    setShowPmtPicker((prev) => !prev);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserWithMbr>({
    defaultValues: {
      user_name: typeof user_name === "string" ? user_name : "",
      user_type: typeof user_type === "string" ? user_type : "",
      description: typeof description === "string" ? description : "",
      pmt_amt: pmt_amt <= 0 ? 0 : pmt_amt,
      pending_amt: pending_amt <= 0 ? 0 : pending_amt,
    },
  });

  const onSaveClick = async (formData: UserWithMbr) => {
    setLoading(true);
    if (user_id > 0) {
      updateUser(
        {
          id: user_id,
          updatedFields: {
            user_type: formData.user_type,
            user_name: formData.user_name,
            description: formData.description,
          },
        },
        {
          onSuccess: () => {},
        }
      );
      updateUserMbr(
        {
          id: user_mbrs_id,
          updatedFields: {
            pmt_amt: formData.pmt_amt,
            pending_amt: formData.pending_amt,
            pmt_dt: pmtDt,
          },
        },
        {
          onSuccess: () => {
            Alert.alert("The user has been saved.");
            router.push("/(admin)/mngUsers/users");
          },
        }
      );
    }
    setLoading(false);
  };

  const onStopClick = async () => {
    if (!(await confirm("STOP", "Do you want to stop membership?"))) return;

    setLoading(true);
    updateUserMbr(
      {
        id: user_mbrs_id,
        updatedFields: {
          status: "STOPPED",
          stopped_cnt: stopped_cnt + 1,
          stop_dt: getFormatDate(new Date()),
        },
      },
      {
        onSuccess: () => {
          setLoading(false);
          Alert.alert("The membership has been stopped.");
          router.push("/(admin)/mngUsers/users");
        },
      }
    );
  };

  const onStartClick = async () => {
    if (!(await confirm("START", "Do you want to start membership?"))) return;

    setLoading(true);
    updateUserMbr(
      {
        id: user_mbrs_id,
        updatedFields: {
          status: "NORMAL",
          stop_dt: null,
          start_dt: getFormatDate(new Date()),
          finish_dt: addDaysToDate(
            String(finish_dt),
            daysDifference(String(stop_dt), getFormatDate(new Date()))
          ),
        },
      },
      {
        onSuccess: () => {
          setLoading(false);
          Alert.alert("The membership has been stopped.");
          router.push("/(admin)/mngUsers/users");
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader headerTtitle={"Edit User"} />
      <ScrollView>
        <CustomInputA
          name="user_name"
          placeholder="Enter Name"
          label="Name"
          control={control}
          rules={{
            required: "Name is required.",
          }}
        />
        <CustomInputB label="Contact" value={contact} />
        <CustomSelectDropdown
          name="user_type"
          label="Type"
          control={control}
          disabled={
            user?.user_type !== "ADMIN" && user?.user_type !== "DIRECTOR"
          }
          data={[
            { title: "ADMIN" },
            { title: "DIRECTOR" },
            { title: "MANAGER" },
            { title: "USER" },
          ]}
          rules={{
            required: "Type is required.",
          }}
        />
        <CustomInputA
          name="description"
          placeholder="Enter Description"
          label="Description"
          control={control}
        />

        {user_type !== "USER" ? (
          <View></View>
        ) : mbr_type ? (
          <View
            style={{
              marginTop: 15,
              borderColor: Colors.lightgray,
              borderWidth: 1,
              borderRadius: 10,
              padding: 20,
            }}
          >
            <View style={styles.infoRow}>
              <Text>{`${mbr_name} - ${mbr_type}`}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text>{`Term: ${join_dt} ~ ${finish_dt}`}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text>{`Status: ${status}`}</Text>
            </View>
            {stop_cnt > 0 && (
              <View style={styles.infoRow}>
                <Text>{`Stopped / Stop: ${stopped_cnt} / ${stop_cnt}`}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text>{`Pay Method: ${pmt_mthd}`}</Text>
            </View>
            <View style={{ marginVertical: 15 }} />
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
            {status !== "FINISH" &&
              status !== "STOPPED" &&
              stop_cnt > 0 &&
              stop_cnt > stopped_cnt && (
                <TouchableOpacity
                  style={{
                    borderColor: Colors.gray,
                    borderWidth: 1,
                    borderRadius: 5,
                    padding: 5,
                    width: 100,
                    marginTop: 20,
                  }}
                  onPress={onStopClick}
                >
                  <Text style={{ textAlign: "center" }}>Stop</Text>
                </TouchableOpacity>
              )}
            {status === "STOPPED" && (
              <TouchableOpacity
                style={{
                  borderColor: Colors.gray,
                  borderWidth: 1,
                  borderRadius: 5,
                  padding: 5,
                  width: 100,
                  marginTop: 20,
                }}
                onPress={onStartClick}
              >
                <Text style={{ textAlign: "center" }}>Start</Text>
              </TouchableOpacity>
            )}
            {status === "FINISH" && (
              <TouchableOpacity
                style={{
                  borderColor: Colors.gray,
                  borderWidth: 1,
                  borderRadius: 5,
                  padding: 5,
                  width: 150,
                  marginTop: 20,
                }}
                onPress={() =>
                  router.push({
                    pathname: "/(admin)/mngUsers/regMbr",
                    params: {
                      user_id: user_id,
                    },
                  })
                }
              >
                <Text style={{ textAlign: "center" }}>Reg. Membership</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View
            style={{
              marginTop: 30,
              borderWidth: 1,
              borderColor: Colors.black,
              borderRadius: 5,
              padding: 10,
              //   alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 16 }}>Welcome Guest</Text>
            <View style={styles.rowContainer}>
              <View></View>
              <TouchableOpacity
                style={styles.rowContainer}
                onPress={() =>
                  router.push({
                    pathname: "/(admin)/mngUsers/regMbr",
                    params: {
                      user_id: user_id,
                    },
                  })
                }
              >
                <Text>Reg. Membership </Text>
                <AntDesign name="arrowright" size={20} color={Colors.black} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      <View>
        <CustomButton text="SAVE" onPress={handleSubmit(onSaveClick)} />
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
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoRow: {
    marginVertical: 5,
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

export default ManageUser;
