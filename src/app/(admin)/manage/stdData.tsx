import { View, Alert, StyleSheet, ScrollView } from "react-native";
import React, { useState } from "react";
import Colors from "@/constants/Colors";
import CustomHeader from "@/components/CustomHeader";
import CustomButton from "@/components/CustomButton";
import { CustomInputA, CustomTimePicker } from "@/components/CustomInput";
import LoadingIndicator from "@/components/LodingIndicator";
import { useRouter } from "expo-router";
import { Tables } from "@/types";
import { useForm } from "react-hook-form";
import { useCommDataContext } from "@/providers/CommDataProvider";
import { useUpdateStdData } from "@/api/stdData";

type Code = Tables<"codes">;

type FormValues = Code & {
  EVEN_BAY_START_TIME: string;
  EVEN_BAY_END_TIME: string;
  ODD_BAY_START_TIME: string;
  ODD_BAY_END_TIME: string;
  SCREEN_INTERVAL_TIME: string;
  SCREEN_START_TIME: string;
  SCREEN_END_TIME: string;
  LESSON_START_TIME: string;
  LESSON_END_TIME: string;
  LESSON_INTERVAL_TIME: string;
  PRACTICE_CNT_FOR_DAY: string;
};

const ManageStdData = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { getCodeByGroupAndCode } = useCommDataContext();

  const { mutate: updateCode } = useUpdateStdData();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      EVEN_BAY_START_TIME:
        getCodeByGroupAndCode("STD_TIME", "EVEN_BAY_START_TIME") || "",
      EVEN_BAY_END_TIME:
        getCodeByGroupAndCode("STD_TIME", "EVEN_BAY_END_TIME") || "",
      ODD_BAY_START_TIME:
        getCodeByGroupAndCode("STD_TIME", "ODD_BAY_START_TIME") || "",
      ODD_BAY_END_TIME:
        getCodeByGroupAndCode("STD_TIME", "ODD_BAY_END_TIME") || "",
      SCREEN_INTERVAL_TIME:
        getCodeByGroupAndCode("STD_TIME", "SCREEN_INTERVAL_TIME") || "",
      SCREEN_START_TIME:
        getCodeByGroupAndCode("STD_TIME", "SCREEN_START_TIME") || "",
      SCREEN_END_TIME:
        getCodeByGroupAndCode("STD_TIME", "SCREEN_END_TIME") || "",
      LESSON_START_TIME:
        getCodeByGroupAndCode("STD_TIME", "LESSON_START_TIME") || "",
      LESSON_END_TIME:
        getCodeByGroupAndCode("STD_TIME", "LESSON_END_TIME") || "",
      LESSON_INTERVAL_TIME:
        getCodeByGroupAndCode("STD_TIME", "LESSON_INTERVAL_TIME") || "",
      PRACTICE_CNT_FOR_DAY:
        getCodeByGroupAndCode("STC_CNT", "PRACTICE_CNT_FOR_DAY") || "",
    },
  });

  const isValidTimeFormat = (hhmm: string) => {
    const regex = /^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/;
    return regex.test(hhmm);
  };
  const isValidMinuteFormat = (mm: string) => {
    const regex = /^\d+$/;
    return regex.test(mm);
  };

  const onSaveClick = async (formData: Code) => {
    try {
      setLoading(true);

      for (const [key, value] of Object.entries(formData)) {
        if (!value) continue;
        updateCode(
          {
            group: key === "PRACTICE_CNT_FOR_DAY" ? "STC_CNT" : "STD_TIME",
            code: key,
            updatedFields: {
              code_val: value,
            },
          },
          {
            onSuccess: () => {
              Alert.alert("Standard Data has been saved.");
              router.back();
            },
          }
        );
      }
    } catch (err) {
      console.error("Error Update StdData:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader headerTtitle="Manage Standard Data" />
      <ScrollView>
        {/* <CustomInputA
          name="EVEN_BAY_START_TIME"
          placeholder="Even Bay Start Time (HH:MM)"
          label="Even Start"
          control={control}
          rules={{
            required: "Even Bay Start Time is required",
            pattern: {
              value: /^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/,
              message: "Type in HH:MM format",
            },
          }}
        /> */}
        <CustomTimePicker
          name="EVEN_BAY_START_TIME"
          label="Even Start"
          control={control}
          rules={{
            required: "Even Bay Start Time is required",
            pattern: {
              value: /^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/,
              message: "Type in HH:MM format",
            },
          }}
        />
        {/* <CustomInputA
          name="EVEN_BAY_END_TIME"
          placeholder="Even Bay End Time (HH:MM)"
          label="Even End"
          control={control}
          rules={{
            required: "Even Bay End Time is required",
            pattern: {
              value: /^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/,
              message: "Type in HH:MM format",
            },
          }}
        /> */}
        <CustomTimePicker
          name="EVEN_BAY_END_TIME"
          label="Even End"
          control={control}
          rules={{
            required: "Even Bay End Time is required",
            pattern: {
              value: /^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/,
              message: "Type in HH:MM format",
            },
          }}
        />
        {/* <CustomInputA
          name="ODD_BAY_START_TIME"
          placeholder="Odd Bay Start Time (HH:MM)"
          label="Odd Start"
          control={control}
          rules={{
            required: "Odd Bay Start is required",
            pattern: {
              value: /^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/,
              message: "Type in HH:MM format",
            },
          }}
        /> */}
        <CustomTimePicker
          name="ODD_BAY_START_TIME"
          label="Odd Start"
          control={control}
          rules={{
            required: "Odd Bay Start is required",
            pattern: {
              value: /^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/,
              message: "Type in HH:MM format",
            },
          }}
        />
        {/* <CustomInputA
          name="ODD_BAY_END_TIME"
          placeholder="Odd Bay End Time (HH:MM)"
          label="Odd End"
          control={control}
          rules={{
            required: "Odd Bay End Time is required",
            pattern: {
              value: /^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/,
              message: "Type in HH:MM format",
            },
          }}
        /> */}
        <CustomTimePicker
          name="ODD_BAY_END_TIME"
          label="Odd End"
          control={control}
          rules={{
            required: "Odd Bay End Time is required",
            pattern: {
              value: /^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/,
              message: "Type in HH:MM format",
            },
          }}
        />
        {/* <CustomInputA
          name="SCREEN_START_TIME"
          placeholder="Screen Start Time (MM)"
          label="Scrn Start"
          control={control}
          rules={{
            required: "Screen Start Time is required",
            pattern: {
              value: /^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/,
              message: "Type in HH:MM format",
            },
          }}
        /> */}
        <CustomTimePicker
          name="SCREEN_START_TIME"
          label="Scrn Start"
          control={control}
          rules={{
            required: "Screen Start Time is required",
            pattern: {
              value: /^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/,
              message: "Type in HH:MM format",
            },
          }}
        />
        {/* <CustomInputA
          name="SCREEN_END_TIME"
          placeholder="Screen End Time (MM)"
          label="Scrn End"
          control={control}
          rules={{
            required: "Screen End Time is required",
            pattern: {
              value: /^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/,
              message: "Type in HH:MM format",
            },
          }}
        /> */}
        <CustomTimePicker
          name="SCREEN_END_TIME"
          label="Scrn End"
          control={control}
          rules={{
            required: "Screen End Time is required",
            pattern: {
              value: /^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/,
              message: "Type in HH:MM format",
            },
          }}
        />
        <CustomInputA
          name="SCREEN_INTERVAL_TIME"
          placeholder="Screen Interval (MM)"
          label="Scrn Interval"
          control={control}
          rules={{
            required: "Screen Interval is required",
            pattern: {
              value: /^\d+$/,
              message: "Type in MM format",
            },
          }}
          inputMode="numeric"
        />
        {/* <CustomInputA
          name="LESSON_START_TIME"
          placeholder="Lesson Start Time (HH:MM)"
          label="Lesson Start"
          control={control}
          rules={{
            required: "Lesson Start Time is required",
            pattern: {
              value: /^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/,
              message: "Type in HH:MM format",
            },
          }}
        /> */}
        <CustomTimePicker
          name="LESSON_START_TIME"
          label="Lesson Start"
          control={control}
          rules={{
            required: "Lesson Start Time is required",
            pattern: {
              value: /^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/,
              message: "Type in HH:MM format",
            },
          }}
        />
        {/* <CustomInputA
          name="LESSON_END_TIME"
          placeholder="Lesson End Time (HH:MM)"
          label="Lesson End"
          control={control}
          rules={{
            required: "Lesson End Time is required",
            pattern: {
              value: /^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/,
              message: "Type in HH:MM format",
            },
          }}
        /> */}
        <CustomTimePicker
          name="LESSON_END_TIME"
          label="Lesson End"
          control={control}
          rules={{
            required: "Lesson End Time is required",
            pattern: {
              value: /^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/,
              message: "Type in HH:MM format",
            },
          }}
        />
        <CustomInputA
          name="LESSON_INTERVAL_TIME"
          placeholder="Lesson Interval (MM)"
          label="lesson Interval"
          control={control}
          rules={{
            required: "Lesson Interval is required",
            pattern: {
              value: /^\d+$/,
              message: "Type in MM format",
            },
          }}
          inputMode="numeric"
        />
        <CustomInputA
          name="PRACTICE_CNT_FOR_DAY"
          placeholder="Max Booking Cnt"
          label="Max Book Cnt"
          control={control}
          rules={{
            required: "Lesson Interval is required",
            pattern: {
              value: /^\d+$/,
              message: "Type in MM format",
            },
          }}
          inputMode="numeric"
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

export default ManageStdData;
