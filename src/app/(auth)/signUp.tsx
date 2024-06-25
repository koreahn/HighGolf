import {
  View,
  // Text,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import React, { useState } from "react";
import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import Colors from "@/constants/Colors";
import { Link, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { useInsertUser } from "@/api/users";
import CustomText from "@/components/CustomText";

const Text = CustomText;

interface signUpData {
  userName: string;
  email: string;
  password: string;
}

const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { mutate: insertUser } = useInsertUser();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<signUpData>();

  const signUpWithEmail = async (data: signUpData) => {
    setLoading(true);
    const { email, password, userName } = data;

    const {
      data: { user, session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Alert.alert(error.message);
      if (error.message === "User already registered") {
        router.push("/signIn");
      }
    } else {
      if (user?.id) {
        insertUser(
          {
            branch_id: 1,
            id: user?.id,
            user_type: "USER",
            branch_name: "HighGolf",
            user_name: userName,
            contact: email,
          },
          {
            onSuccess: () => {},
          }
        );

        if (session) {
          supabase.auth.setSession(session);
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("@assets/images/logo.jpeg")}
        resizeMode="contain"
        style={styles.logo}
      />
      <View style={styles.contents}>
        <CustomInput
          name="userName"
          placeholder="이름을 입력하세요."
          label="이름 (Name)"
          control={control}
          rules={{
            required: "이름은 필수 항목입니다.",
          }}
          inputMode="numeric"
        />
        <CustomInput
          name="email"
          placeholder="E-Mail 을 입력하세요."
          label="E-Mail"
          control={control}
          rules={{
            required: "E-Mail은 필수 항목입니다.",
            pattern: {
              value:
                /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
              message: "E-Mail 형식에 맞지 않습니다..",
            },
          }}
          inputMode="numeric"
        />
        <CustomInput
          name="password"
          placeholder="비밀번호를 입력하세요."
          label="비밀번호 (Password)"
          control={control}
          rules={{
            required: "비밀번호는 필수 항목입니다.",
            pattern: {
              value: /^\d{6,}$/,
              message: "6자리 이상 입력하세요.",
            },
          }}
          secureTextEntry={true}
        />

        <CustomButton
          onPress={handleSubmit(signUpWithEmail)}
          text={loading ? "Creating account..." : "Sign Up"}
          disabled={loading}
        />
        <Link href="/" style={styles.textButton}>
          Sign In
        </Link>
      </View>
    </View>
  );
};

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
    marginTop: 30,
  },
  logo: {
    marginTop: 100,
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

export default SignUp;
