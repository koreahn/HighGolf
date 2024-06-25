import { View, StyleSheet, ScrollView, Alert } from "react-native";
import React, { useState } from "react";
import Colors from "@/constants/Colors";
import CustomHeader from "@/components/CustomHeader";
import CustomButton from "@/components/CustomButton";
import { useForm } from "react-hook-form";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Tables } from "@/types";
import {
  CustomInputA,
  CustomSelectDropdown,
  CustomTimePicker,
} from "@/components/CustomInput";
import LoadingIndicator from "@/components/LodingIndicator";
import { useInsertFacility, useUpdateFacility } from "@/api/facilities";

type Facility = Tables<"facilities">;

const ManageFacility = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    facility_id: idString,
    facility_type,
    display_name,
    start_tm,
    end_tm,
    is_available: isAvaString,
    order: orderString,
    description,
  } = useLocalSearchParams();
  const facility_id =
    idString === undefined
      ? -1
      : parseFloat(typeof idString === "string" ? idString : idString?.[0]);
  const order =
    orderString === undefined
      ? undefined
      : parseFloat(
          typeof orderString === "string" ? orderString : orderString?.[0]
        );
  const is_available =
    isAvaString === "true" ? true : isAvaString === "false" ? false : undefined;

  const { mutate: insertFacility } = useInsertFacility();
  const { mutate: updateFacility } = useUpdateFacility();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Facility>({
    defaultValues: {
      facility_type: typeof facility_type === "string" ? facility_type : "",
      display_name: typeof display_name === "string" ? display_name : "",
      start_tm: typeof start_tm === "string" ? start_tm : "",
      end_tm: typeof end_tm === "string" ? end_tm : "",
      is_available: is_available,
      order: order,
      description: typeof description === "string" ? description : "",
    },
  });

  const onSaveClick = async (formData: Facility) => {
    setLoading(true);
    if (facility_id >= 0) {
      updateFacility(
        {
          id: facility_id,
          updatedFields: {
            facility_type: formData.facility_type,
            display_name: formData.display_name,
            start_tm: formData.start_tm,
            end_tm: formData.end_tm,
            is_available: formData.is_available,
            order: formData.order,
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
      insertFacility(
        {
          branch_id: 1,
          facility_type: formData.facility_type,
          display_name: formData.display_name,
          start_tm: formData.start_tm,
          end_tm: formData.end_tm,
          is_available: formData.is_available,
          order: formData.order,
          description: formData.description,
        },
        {
          onSuccess: () => {
            Alert.alert("The Facility has been saved.");
            router.back();
          },
        }
      );
    }
    setLoading(true);
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        headerTtitle={facility_id > 0 ? "Edit Facility" : "Register Facility"}
      />
      <ScrollView>
        <CustomSelectDropdown
          name="facility_type"
          label="Type"
          control={control}
          data={[{ title: "Bay" }, { title: "Screen" }]}
          rules={{
            required: "Type is required.",
          }}
        />
        <CustomInputA
          name="display_name"
          placeholder="Enter Name"
          label="Name"
          control={control}
          rules={{
            required: "Name is required.",
          }}
        />
        <CustomTimePicker
          name="start_tm"
          label="Start Time"
          control={control}
          rules={{
            required: "Start Time is required.",
          }}
        />
        <CustomTimePicker
          name="end_tm"
          label="End Time"
          control={control}
          rules={{
            required: "End Time is required.",
          }}
        />
        <CustomSelectDropdown
          name="is_available"
          label="Available"
          control={control}
          data={[{ title: "true" }, { title: "false" }]}
          rules={{
            required: "Available is required.",
          }}
        />
        <CustomInputA
          name="order"
          placeholder="Enter Sequence"
          label="Sequence"
          control={control}
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

export default ManageFacility;
