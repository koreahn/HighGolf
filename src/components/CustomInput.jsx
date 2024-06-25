import React, { useState } from "react";
import {
  View,
  // Text,
  // TextInput,
  StyleSheet,
} from "react-native";
import { Controller } from "react-hook-form";
import Icon from "react-native-vector-icons/AntDesign";
import Colors from "@/constants/Colors";
import SelectDropdown from "react-native-select-dropdown";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { TouchableOpacity } from "react-native";
import { getFormatDate } from "./commonFunc";
import CustomText from "@/components/CustomText";
import CustomTextInput from "@/components/\bCustomTextInput";

const Text = CustomText;
const TextInput = CustomTextInput;

const CustomInput = ({
  control,
  name,
  rules = {},
  placeholder,
  secureTextEntry = false,
  inputMode = "text",
  label,
  editable = true,
  multiline = false,
}) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>{label ? label : placeholder} </Text>
            {rules.required ? <Icon name="star" size={8} /> : ""}
          </View>
          <View
            style={[
              styles.container,
              { borderColor: error ? Colors.red : Colors.light.tint },
              { height: multiline ? 120 : 40 },
            ]}
          >
            <TextInput
              style={{ color: Colors.black, height: multiline ? 120 : 40 }}
              value={value}
              onBlur={onBlur}
              placeholderTextColor={Colors.gray}
              onChangeText={onChange}
              placeholder={
                rules.required ? placeholder : placeholder + " (OPTIONAL)"
              }
              secureTextEntry={secureTextEntry}
              inputMode={inputMode || "text"}
              returnKeyType="done"
              editable={editable}
              multiline={multiline}
              numberOfLines={multiline ? 3 : 1}
            />
          </View>
          {error && (
            <Text style={styles.errorText}>{error.message || "Error"}</Text>
          )}
        </>
      )}
    />
  );
};

const CustomInputA = ({
  control,
  name,
  rules = {},
  placeholder,
  secureTextEntry = false,
  inputMode = "text",
  label,
  editable = true,
  multiline = false,
}) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <>
          <View
            style={[styles.rowContainer, { justifyContent: "space-between" }]}
          >
            <Text style={styles.aText}>{label}: </Text>
            <TextInput
              style={styles.aInput}
              value={
                // !value ? "" : typeof value !== "string" ? String(value) : value
                value !== undefined ? String(value) : ""
              }
              onBlur={onBlur}
              placeholderTextColor={Colors.gray}
              onChangeText={onChange}
              placeholder={
                rules.required ? placeholder : placeholder + " (OPTIONAL)"
              }
              secureTextEntry={secureTextEntry}
              inputMode={inputMode || "text"}
              returnKeyType="done"
              editable={editable}
              multiline={multiline}
              numberOfLines={multiline ? 3 : 1}
            />
          </View>
          {error && (
            <Text style={styles.errorText}>{error.message || "Error"}</Text>
          )}
        </>
      )}
    />
  );
};

const CustomInputB = ({ value, label }) => {
  return (
    <View style={[styles.rowContainer, { justifyContent: "space-between" }]}>
      <Text style={styles.aText}>{label}: </Text>
      <Text
        style={[
          styles.aInput,
          { color: Colors.gray, borderColor: Colors.gray },
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

const CustomSelectDropdown = ({
  control,
  name,
  rules = {},
  label,
  data,
  disabled = false,
  defaultValue = "",
}) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <>
          <View
            style={[styles.rowContainer, { justifyContent: "space-between" }]}
          >
            <Text style={styles.aText}>{label}: </Text>
            <SelectDropdown
              data={data}
              disabled={disabled}
              onSelect={(item) => onChange(item.title)}
              renderButton={(selectedItem, isOpened) => (
                <View
                  style={{
                    flexDirection: "row",
                    width: "65%",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderColor: !disabled ? Colors.light.tint : Colors.gray,
                    borderWidth: 1,
                    height: 30,
                    borderRadius: 5,
                    paddingHorizontal: 10,
                  }}
                >
                  <TextInput
                    style={{ color: !disabled ? Colors.black : Colors.gray }}
                    value={
                      typeof value !== "boolean"
                        ? value
                        : value
                        ? "true"
                        : "false"
                    }
                    editable={false}
                  />
                  <Icon
                    name={isOpened ? "up" : "down"}
                    size={18}
                    color={!disabled ? Colors.black : Colors.gray}
                  />
                </View>
              )}
              renderItem={(item, index, isSelected) => (
                <View
                  style={{
                    width: "100%",
                    flexDirection: "row",
                    paddingHorizontal: 12,
                    justifyContent: "center",
                    alignItems: "center",
                    paddingVertical: 8,
                    ...(isSelected && { backgroundColor: "#D2D9DF" }),
                  }}
                >
                  <Text style={{ flex: 1, fontSize: 14, color: Colors.black }}>
                    {item.title}
                  </Text>
                </View>
              )}
              showsVerticalScrollIndicator={false}
              dropdownStyle={{ borderRadius: 8 }}
            />
          </View>
          {error && (
            <Text style={styles.errorText}>{error.message || "Error"}</Text>
          )}
        </>
      )}
    />
  );
};

const CustomTimePicker = ({ control, name, rules = {}, label }) => {
  const [showPicker, setShowPicker] = useState(false);

  const toggleTimePicker = () => {
    setShowPicker((prev) => !prev);
  };

  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <>
          <View
            style={[styles.rowContainer, { justifyContent: "space-between" }]}
          >
            <Text style={styles.aText}>{label}: </Text>

            <TouchableOpacity style={styles.aInput} onPress={toggleTimePicker}>
              <Text style={{ textAlign: "left" }}>{value}</Text>
              <DateTimePickerModal
                isVisible={showPicker}
                mode="time"
                onConfirm={(time) => {
                  onChange(formatTime(time));
                  toggleTimePicker();
                }}
                onCancel={toggleTimePicker}
                minuteInterval={10}
                date={
                  value
                    ? new Date(
                        new Date().setHours(
                          parseInt(value.split(":")[0]),
                          parseInt(value.split(":")[1])
                        )
                      )
                    : new Date()
                }
              />
            </TouchableOpacity>
          </View>
          {error && (
            <Text style={styles.errorText}>{error.message || "Error"}</Text>
          )}
        </>
      )}
    />
  );
};

const CustomDatePicker = ({ control, name, rules = {}, label }) => {
  const [showPicker, setShowPicker] = useState(false);

  const toggleDatePicker = () => {
    setShowPicker((prev) => !prev);
  };

  const formatTime = (date) => {
    // const hours = date.getHours().toString().padStart(2, "0");
    // const minutes = date.getMinutes().toString().padStart(2, "0");
    // return `${hours}:${minutes}`;
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({
        field: { value, onChange, onBlur },
        fieldState: { error },
      }) => (
        <>
          <View
            style={[styles.rowContainer, { justifyContent: "space-between" }]}
          >
            <Text style={styles.aText}>{label}: </Text>

            <TouchableOpacity style={styles.aInput} onPress={toggleDatePicker}>
              <Text style={{ textAlign: "left" }}>{value}</Text>
              <DateTimePickerModal
                isVisible={showPicker}
                mode="date"
                onConfirm={(date) => {
                  onChange(getFormatDate(date));
                  toggleDatePicker();
                }}
                onCancel={toggleDatePicker}
                minuteInterval={10}
                date={value ? new Date(value) : new Date()}
              />
            </TouchableOpacity>
          </View>
          {error && (
            <Text style={styles.errorText}>{error.message || "Error"}</Text>
          )}
        </>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 10,
    justifyContent: "center",
  },
  input: {},
  labelContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  label: {
    fontSize: 10,
    color: Colors.black,
  },
  errorText: {
    color: Colors.red,
    alignSelf: "stretch",
    fontSize: 10,
    marginBottom: 10,
    marginTop: -10,
  },

  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "space-between",
  },
  aText: {
    width: "35%",
  },
  aInput: {
    color: Colors.black,
    borderColor: Colors.light.tint,
    borderWidth: 1,
    height: 30,
    width: "65%",
    borderRadius: 5,
    padding: 5,
    paddingHorizontal: 10,
  },
  time: {
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    justifyContent: "center",
    width: "30%",
    height: 30,
  },
});

export default CustomInput;
export {
  CustomInputA,
  CustomInputB,
  CustomSelectDropdown,
  CustomTimePicker,
  CustomDatePicker,
};
