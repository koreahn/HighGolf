import { View, StyleSheet, ScrollView, Alert } from "react-native";
import React, { useState } from "react";
import Colors from "@/constants/Colors";
import CustomHeader from "@/components/CustomHeader";
import CustomButton from "@/components/CustomButton";
import { useForm } from "react-hook-form";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Tables } from "@/types";
import { CustomInputA, CustomSelectDropdown } from "@/components/CustomInput";
import LoadingIndicator from "@/components/LodingIndicator";
import {
  useInsertMembership,
  useUpdateMembership,
  useDeleteMembership,
} from "@/api/memberships";

type Membership = Tables<"memberships">;

const ManageMbr = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    mbr_id: idString,
    mbr_type,
    mbr_name,
    nick,
    division,
    price: priceString,
    stop_cnt: stopString,
    lesson_min: minString,
    lesson_cnt: cntString,
    description,
  } = useLocalSearchParams();
  const mbr_id =
    idString === undefined
      ? 0
      : parseFloat(typeof idString === "string" ? idString : idString?.[0]);
  const price =
    priceString === undefined
      ? undefined
      : parseFloat(
          typeof priceString === "string" ? priceString : priceString?.[0]
        );
  const stop_cnt =
    stopString === undefined
      ? undefined
      : parseFloat(
          typeof stopString === "string" ? stopString : stopString?.[0]
        );
  const lesson_min =
    minString === undefined
      ? undefined
      : parseFloat(typeof minString === "string" ? minString : minString?.[0]);
  const lesson_cnt =
    cntString === undefined
      ? undefined
      : parseFloat(typeof cntString === "string" ? cntString : cntString?.[0]);

  const { mutate: insertMbr } = useInsertMembership();
  const { mutate: updateMbr } = useUpdateMembership();
  const { mutate: deleteMbr } = useDeleteMembership();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Membership>({
    defaultValues: {
      mbr_type: typeof mbr_type === "string" ? mbr_type : "",
      mbr_name: typeof mbr_name === "string" ? mbr_name : "",
      nick: typeof nick === "string" ? nick : "",
      division: typeof division === "string" ? division : "",
      price: price,
      stop_cnt: stop_cnt,
      lesson_min: lesson_min,
      lesson_cnt: lesson_cnt,
      description: typeof description === "string" ? description : "",
    },
  });

  const onSaveClick = async (formData: Membership) => {
    setLoading(true);
    if (mbr_id > 0) {
      updateMbr(
        {
          id: mbr_id,
          updatedFields: {
            mbr_type: formData.mbr_type,
            mbr_name: formData.mbr_name,
            nick: formData.nick,
            division: formData.division,
            price: formData.price,
            stop_cnt: formData.stop_cnt ? formData.stop_cnt : 0,
            lesson_min: formData.lesson_min ? formData.lesson_min : 0,
            lesson_cnt: formData.lesson_cnt ? formData.lesson_cnt : 0,
            description: formData.description,
          },
        },
        {
          onSuccess: () => {
            Alert.alert("The membership has been saved.");
            router.back();
          },
        }
      );
    } else {
      insertMbr(
        {
          branch_id: 1,
          mbr_type: formData.mbr_type,
          mbr_name: formData.mbr_name,
          nick: formData.nick,
          division: formData.division,
          price: formData.price,
          stop_cnt: formData.stop_cnt ? formData.stop_cnt : 0,
          lesson_min: formData.lesson_min ? formData.lesson_min : 0,
          lesson_cnt: formData.lesson_cnt ? formData.lesson_cnt : 0,
          description: formData.description,
        },
        {
          onSuccess: () => {
            Alert.alert("The membership has been saved.");
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
      deleteMbr(
        {
          id: mbr_id,
        },
        {
          onSuccess: () => {
            Alert.alert("The membership has been deleted.");
            router.back();
          },
        }
      );
    } catch (err) {
      console.error("Error delete membership:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        headerTtitle={mbr_id > 0 ? "Edit Membership" : "Register Membership"}
        {...(mbr_id > 0 && { path: undefined, deleteFunc: deleteFunc })}
      />
      <ScrollView>
        <CustomSelectDropdown
          name="mbr_type"
          label="Type"
          control={control}
          data={[{ title: "S/P" }, { title: "W/L" }]}
          rules={{
            required: "Type is required.",
          }}
        />
        <CustomInputA
          name="mbr_name"
          placeholder="Enter Name"
          label="Name"
          control={control}
          rules={{
            required: "Name is required.",
          }}
        />
        <CustomSelectDropdown
          name="nick"
          label="Code"
          control={control}
          data={[
            { title: "M1" },
            { title: "M3" },
            { title: "M6" },
            { title: "M12" },
          ]}
          rules={{
            required: "Code is required.",
          }}
        />
        <CustomSelectDropdown
          name="division"
          label="Division"
          control={control}
          data={[
            { title: "1 MONTH" },
            { title: "3 MONTH" },
            { title: "6 MONTH" },
            { title: "12 MONTH" },
          ]}
          rules={{
            required: "Division is required.",
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
          name="stop_cnt"
          placeholder="Enter Stop Count"
          label="Stop Count"
          control={control}
          rules={{
            pattern: {
              value: /^\d+$/,
              message: "Please enter a number for price.",
            },
          }}
        />
        <CustomInputA
          name="lesson_min"
          placeholder="Enter Lesson Mins"
          label="Lesson Mins"
          control={control}
          rules={{
            pattern: {
              value: /^\d+$/,
              message: "Please enter a number for price.",
            },
          }}
        />
        <CustomInputA
          name="lesson_cnt"
          placeholder="Enter Lesson Count"
          label="Lesson Count"
          control={control}
          rules={{
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

export default ManageMbr;
