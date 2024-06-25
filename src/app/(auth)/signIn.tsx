import {
  View,
  StyleSheet,
  Image,
  Alert,
  TouchableOpacity,
  // Text,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import CustomInput from "@/components/CustomInput";
import CustomPhoneInput from "@/components/CustomPhoneInput";
import CustomButton from "@/components/CustomButton";
import Colors from "@/constants/Colors";
import { supabase } from "@/lib/supabase";
import CustomText from "@/components/CustomText";

const Text = CustomText;

// import { createClient } from "@supabase/supabase-js";
// import { Database } from "@/database.types";

// const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "";
// const role = process.env.EXPO_PUBLIC_SUPABASE_ROLE || "";
// const supabase1 = createClient<Database>(supabaseUrl, role);

interface signInData {
  phone: string;
  otp: string;
}

const SignIn = () => {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  // async function createSupabaseUser() {
  //   console.log("start");
  //   const { data, error } = await supabase.from("temp").select("*");

  //   data?.map((user) => {
  //     createUser(user.contact, user.user_name);
  //   });

  //   console.log("end");
  // }

  // const createUser = async (contact: string, user_name: string | null) => {
  //   const { data, error } = await supabase1.auth.admin.createUser({
  //     phone: contact,
  //     phone_confirm: true,
  //     user_metadata: { name: user_name },
  //   });

  //   if (error) {
  //     console.log("error", user_name);
  //   }
  // };

  const onSignInPressed = async (formData: signInData) => {
    try {
      setReady(true);
      const { phone } = formData;

      const { data, error } = await supabase.auth.signInWithOtp({
        phone: "+91" + phone,
      });

      if (error) {
        console.log("err", error);
        Alert.alert(error.message);
      }
    } catch (err) {
      console.error("Error onSignInPressed:", err);
    }
  };

  const onVerifyOtp = async (formData: signInData) => {
    try {
      const { phone, otp } = formData;

      const {
        data: { session },
        error,
      } = await supabase.auth.verifyOtp({
        phone: "+91" + phone,
        token: otp,
        type: "sms",
      });

      if (error) {
        console.log("err", error);
        Alert.alert(error.message);
      }
    } catch (err) {
      console.error("Error onVerifyOtp:", err);
    }
  };

  const onResendOtp = async () => {
    const currentPhone = getValues("phone");
    const phonePattern = /^[6-9]{1}[0-9]{9}$/;
    if (!currentPhone || !phonePattern.test(currentPhone)) {
      Alert.alert("Phone Number", "전화번호 형식이 올바르지 않습니다");
      return;
    }

    if (currentPhone) {
      try {
        const { data, error } = await supabase.auth.signInWithOtp({
          phone: "+91" + currentPhone,
        });

        if (error) {
          console.log("err", error);
          Alert.alert(error.message);
        } else {
          Alert.alert("새 OTP가 발송되었습니다.");
        }
      } catch (err) {
        console.error("Error onResendOtp:", err);
      }
    } else {
      Alert.alert("전화번호를 입력하세요.");
    }
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<signInData>();

  return (
    <View style={styles.container}>
      <Image
        source={require("@assets/images/logo.jpeg")}
        resizeMode="contain"
        style={styles.logo}
      />
      <View style={styles.contents}>
        <CustomPhoneInput
          name="phone"
          placeholder="전화번호를 입력하세요."
          label="Phone Number"
          control={control}
          rules={{
            required: "전화번호는 필수 항목입니다.",
            pattern: {
              value: /^[6-9]{1}[0-9]{9}$/,
              message: "전화번호 형식이 올바르지 않습니다",
            },
          }}
          inputMode="tel"
        />
        {ready && (
          <CustomInput
            name="otp"
            placeholder="OTP 를 입력하세요."
            label="OTP"
            control={control}
            rules={{
              required: "OTP 는 필수 항목입니다.",
              pattern: {
                value: /^[0-9]{6}$/,
                message: "6자리 숫자를 입력하세요.",
              },
            }}
            inputMode="numeric"
          />
        )}
        {!ready ? (
          <CustomButton
            text="Get OTP"
            onPress={handleSubmit(onSignInPressed)}
            // onPress={createSupabaseUser}
          />
        ) : (
          <>
            <CustomButton text="Sign In" onPress={handleSubmit(onVerifyOtp)} />
            <TouchableOpacity onPress={onResendOtp}>
              <Text style={styles.textButton}>Resend OTP</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
  },
  contents: {
    alignContent: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    marginTop: 10,
  },
  logo: {
    marginTop: 50,
    width: "100%",
    height: 250,
  },
  textButton: {
    alignSelf: "center",
    fontWeight: "bold",
    color: Colors.light.tint,
    marginVertical: 10,
  },
});
