import React from "react";
import {
  View,
  // Text,
  // TextInput,
  StyleSheet,
} from "react-native";
import { Controller } from "react-hook-form";
import Icon from "react-native-vector-icons/AntDesign";
import Colors from "@/constants/Colors";
import CustomText from "@/components/CustomText";
import CustomTextInput from "@/components/\bCustomTextInput";

const Text = CustomText;
const TextInput = CustomTextInput;

const CustomPhoneInput = ({
  control,
  name,
  rules = {},
  placeholder,
  inputMode,
  label,
  editable = true,
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
            ]}
          >
            <TextInput
              value="+91"
              style={styles.countryCodeInput}
              editable={false}
            />
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholderTextColor={Colors.gray}
              placeholder={placeholder}
              inputMode={inputMode || "numeric"}
              returnKeyType="done"
              editable={editable}
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

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    backgroundColor: Colors.white,
  },
  countryCodeInput: {
    color: Colors.black,
    width: 40,
    height: 45,
  },
  input: {
    color: Colors.black,
    width: "100%",
    height: 45,
  },
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
});

export default CustomPhoneInput;
