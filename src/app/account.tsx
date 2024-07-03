import { useAuthContext } from "@/providers/AuthProvider";
import { Alert, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
// import { Text, View } from "react-native";
import { View } from "react-native";
import Colors from "@/constants/Colors";
import CustomHeader from "@/components/CustomHeader";
import CustomButton from "@/components/CustomButton";
import { CustomInputA, CustomInputB } from "@/components/CustomInput";
import { useForm } from "react-hook-form";
import { Functions } from "@/types";
import LoadingIndicator from "@/components/LodingIndicator";
import { useState } from "react";
import { useUpdateUser } from "@/api/users";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import CustomText from "@/components/CustomText";

const Text = CustomText;

type UsersWithMbr = Functions<"get_user_and_latest_membership">;
type UserWithMbr = UsersWithMbr[0];

export default function Account() {
  const { user, fetchUser } = useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { mutate: updateUser } = useUpdateUser();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserWithMbr>({
    defaultValues: {
      user_name: user?.user_name,
    },
  });

  const onSaveClick = async (formData: UserWithMbr) => {
    try {
      setLoading(true);
      updateUser(
        {
          id: user?.user_id ?? 0,
          updatedFields: {
            user_name: formData.user_name,
          },
        },
        {
          onSuccess: () => {
            fetchUser();
            Alert.alert("Profile has been changed.");
          },
        }
      );
    } catch (err) {
      console.error("Error Save user in account:", err);
    } finally {
      setLoading(true);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader headerTtitle="Edit Profile" />
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
        <CustomInputB label="Phone" value={user?.contact} />
        {user?.mbr_desc && user.mbr_desc !== "" && (
          <>
            <CustomInputB label="Membership" value={user?.mbr_name} />
            <CustomInputB
              label="Status"
              value={
                user.status
                // user.status === "WAITING"
                //   ? "승인대기 중"
                //   : user.status === "FINISH"
                //   ? "종료"
                //   : user.status === "STOPPED"
                //   ? "중지"
                //   : "정상"
              }
            />
          </>
        )}
      </ScrollView>
      <View>
        <CustomButton text="Save" onPress={handleSubmit(onSaveClick)} />
      </View>
      <TouchableOpacity
        style={{ marginBottom: 30, marginTop: 20, justifyContent: "center" }}
        onPress={() => {
          supabase.auth.signOut();
          router.push("/(auth)/signIn");
        }}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
      {loading && <LoadingIndicator />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  signOutText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.blue,
  },
});
