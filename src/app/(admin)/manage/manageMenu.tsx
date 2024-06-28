import { View, StyleSheet, ScrollView, Alert } from "react-native";
import React, { useState } from "react";
import Colors from "@/constants/Colors";
import CustomHeader from "@/components/CustomHeader";
import CustomButton from "@/components/CustomButton";
import { useForm } from "react-hook-form";
import { useInsertMenu, useUpdateMenu, useDeleteMenu } from "@/api/menus";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Tables } from "@/types";
import { CustomInputA } from "@/components/CustomInput";
import LoadingIndicator from "@/components/LodingIndicator";

type Menu = Tables<"menus">;

const ManageMenu = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    menu_id: idString,
    kor_nm,
    eng_nm,
    price: priceString,
    description,
  } = useLocalSearchParams();
  const menu_id =
    idString === undefined
      ? 0
      : parseFloat(typeof idString === "string" ? idString : idString?.[0]);
  const price =
    priceString === undefined
      ? undefined
      : parseFloat(
          typeof priceString === "string" ? priceString : priceString?.[0]
        );

  const { mutate: updateMenu } = useUpdateMenu();
  const { mutate: insertMenu } = useInsertMenu();
  const { mutate: deleteMenu } = useDeleteMenu();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Menu>({
    defaultValues: {
      kor_nm: typeof kor_nm === "string" ? kor_nm : "",
      eng_nm: typeof eng_nm === "string" ? eng_nm : "",
      price: price,
      description: typeof description === "string" ? description : "",
    },
  });

  const onSaveClick = async (formData: Menu) => {
    setLoading(true);
    if (menu_id > 0) {
      updateMenu(
        {
          id: menu_id,
          updatedFields: {
            kor_nm: formData.kor_nm,
            eng_nm: formData.eng_nm,
            price: formData.price,
            description: formData.description,
          },
        },
        {
          onSuccess: () => {
            Alert.alert("The menu has been saved.");
            router.back();
          },
        }
      );
    } else {
      insertMenu(
        {
          branch_id: 1,
          description: formData.description,
          eng_nm: formData.eng_nm,
          is_stock: true,
          kor_nm: formData.kor_nm,
          price: formData.price,
        },
        {
          onSuccess: () => {
            Alert.alert("The menu has been saved.");
            router.back();
          },
        }
      );
    }
    setLoading(false);
  };

  const deleteFunc = async () => {
    try {
      setLoading(true);
      deleteMenu(
        {
          id: menu_id,
        },
        {
          onSuccess: () => {
            Alert.alert("The menu has been deleted.");
            router.back();
          },
        }
      );
    } catch (err) {
      console.error("Error delete menu:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        headerTtitle={menu_id > 0 ? "Edit Menu" : "Register Menu"}
        {...(menu_id > 0 && { path: undefined, deleteFunc: deleteFunc })}
      />
      <ScrollView>
        <CustomInputA
          name="kor_nm"
          placeholder="Enter Korean Name"
          label="Kor Name"
          control={control}
          rules={{
            required: "Korean Name is required",
          }}
        />
        <CustomInputA
          name="eng_nm"
          placeholder="Enter English Name"
          label="Eng Name"
          control={control}
          rules={{
            required: "English Name is required",
          }}
        />
        <CustomInputA
          name="price"
          placeholder="Enter Price"
          label="Price"
          control={control}
          rules={{
            required: "Price is required",
            pattern: {
              value: /^\d+$/,
              message: "Please enter a number for price.",
            },
          }}
        />
        <CustomInputA
          name="description"
          placeholder="Enter Description"
          label="Description"
          control={control}
        />
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
});

export default ManageMenu;
