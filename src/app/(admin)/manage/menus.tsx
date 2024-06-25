import {
  View,
  // Text,
  StyleSheet,
  FlatList,
  ListRenderItemInfo,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import Colors from "@/constants/Colors";
import CustomHeader from "@/components/CustomHeader";
import CustomButton from "@/components/CustomButton";
import { confirm } from "@/components/commonFunc";
import { AntDesign } from "@expo/vector-icons";
import { useMenuList, useUpdateStock } from "@/api/menus";
import { Tables } from "@/types";
import { useRouter } from "expo-router";
import LoadingIndicator from "@/components/LodingIndicator";
import CustomText from "@/components/CustomText";

const Text = CustomText;

type Menu = Tables<"menus">;

const Menus = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: menus, error, isLoading } = useMenuList();

  const { mutate: updateMenuStock } = useUpdateStock();

  const renderMenus = ({ item: menu }: ListRenderItemInfo<Menu>) => {
    const onStockChange = async () => {
      const title = menu.eng_nm;
      const value = !menu.is_stock;
      const message = value
        ? `Would you like to change the status of ${menu.eng_nm} to In stock?`
        : `Would you like to change the status of ${menu.eng_nm} to Out of stock?`;

      if (!(await confirm(title, message))) return;

      setLoading(true);
      updateMenuStock(
        { id: menu.menu_id, updatedFields: { is_stock: value } },
        { onSuccess: () => Alert.alert("Stock status has been changed.") }
      );
      setLoading(false);
    };

    return (
      <View style={styles.menuContainer}>
        <View style={styles.rowContainer}>
          <Text
            style={{ fontSize: 14, fontWeight: "600" }}
          >{`${menu.eng_nm} / ${menu.kor_nm} / ₹${menu.price} Rs`}</Text>
          <TouchableOpacity
            style={styles.rowContainer}
            onPress={() =>
              router.push({
                pathname: "/(admin)/manage/manageMenu",
                params: {
                  menu_id: menu.menu_id,
                  kor_nm: menu.kor_nm,
                  eng_nm: menu.eng_nm,
                  price: menu.price,
                  description: menu.description ? menu.description : "",
                },
              })
            }
          >
            <Text>Edit </Text>
            <AntDesign name="arrowright" size={20} color={Colors.black} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.rowContainer, { justifyContent: "flex-start" }]}
          onPress={onStockChange}
        >
          <Text style={!menu.is_stock ? { opacity: 0.5, fontSize: 12 } : {}}>
            In Stock
          </Text>
          <Text> / </Text>
          <Text style={menu.is_stock ? { opacity: 0.5, fontSize: 12 } : {}}>
            Out of Stock
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader headerTtitle="Manage Menus" />
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View style={{ flex: 9 }}>
          <FlatList
            keyboardShouldPersistTaps={"handled"}
            style={{ width: "100%" }}
            data={menus}
            renderItem={renderMenus}
            keyExtractor={(menu) => menu.menu_id.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={{ marginTop: 30, alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: Colors.gray }}>
                  No menus found
                </Text>
              </View>
            )}
          />
        </View>
        <View style={{ flex: 1 }}>
          <CustomButton
            text="New Menu"
            onPress={() =>
              router.push({
                pathname: "/(admin)/manage/manageMenu",
                params: { menu_id: -1 },
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
  menuContainer: {
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

export default Menus;
