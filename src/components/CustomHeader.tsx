import {
  View,
  // Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
} from "react-native";
import React from "react";
import { AntDesign, Feather } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import Colors from "@constants/Colors";
import { useAuthContext } from "@/providers/AuthProvider";
import CustomText from "@/components/CustomText";

const Text = CustomText;

const CustomHeader = ({
  headerTtitle,
  path,
}: {
  headerTtitle: string;
  path?: string;
}) => {
  const router = useRouter();
  const { user } = useAuthContext();

  return (
    <SafeAreaView
      style={[styles.safeArea, Platform.OS === "android" && { marginTop: 15 }]}
    >
      <View style={styles.container}>
        {user.user_name ? (
          <TouchableOpacity
            onPress={() => (path ? router.push("/(admin)/") : router.back())}
          >
            <AntDesign name="arrowleft" size={24} color={Colors.black} />
          </TouchableOpacity>
        ) : (
          <View />
        )}
        <Text style={styles.title}>{headerTtitle}</Text>
        <View />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    width: "100%",
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray,
    marginBottom: 10,
  },
  container: {
    height: 60,
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CustomHeader;
