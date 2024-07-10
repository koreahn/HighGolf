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
        console.error("err", error);
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
        console.error("err", error);
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
      Alert.alert("Phone Number", "The phone number format is incorrect.");
      return;
    }

    if (currentPhone) {
      try {
        const { data, error } = await supabase.auth.signInWithOtp({
          phone: "+91" + currentPhone,
        });

        if (error) {
          console.error("err", error);
          Alert.alert(error.message);
        } else {
          Alert.alert("A new OTP has been sent.");
        }
      } catch (err) {
        console.error("Error onResendOtp:", err);
      }
    } else {
      Alert.alert("Please enter your phone number.");
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
          placeholder="Please enter your phone number."
          label="Phone Number"
          control={control}
          rules={{
            required: "The phone number is required.",
            pattern: {
              value: /^[6-9]{1}[0-9]{9}$/,
              message: "The phone number format is incorrect.",
            },
          }}
          inputMode="numeric"
        />
        {ready && (
          <CustomInput
            name="otp"
            placeholder="Please enter your OTP."
            label="OTP"
            control={control}
            rules={{
              required: "The OTP is required.",
              pattern: {
                value: /^[0-9]{6}$/,
                message: "Please enter a 6-digit number.",
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
