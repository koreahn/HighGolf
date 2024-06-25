import { ActivityIndicator, Alert } from "react-native";
import React, { useEffect } from "react";
import { Redirect, useRouter } from "expo-router";
import { useAuthContext } from "@/providers/AuthProvider";

const Index = () => {
  const router = useRouter();
  const { session, loading, isAdmin, user } = useAuthContext();

  // useEffect(() => {
  //   if (user && session) {
  //     if (!isAdmin) {
  //       if (!user.user_name) {
  //         Alert.alert(
  //           "이름을 저장하신 후 정상적으로 서비스를 이용하실 수 있습니다."
  //         );
  //         router.push("/account");
  //       } else {
  //         router.push("/(user)/");
  //       }
  //     } else {
  //       router.push("/(admin)/");
  //     }
  //   }
  // }, [user]);

  if (loading) {
    return <ActivityIndicator />;
  }

  if (!session) {
    return <Redirect href={"/(auth)/signIn"} />;
  }

  return null;
};

export default Index;
