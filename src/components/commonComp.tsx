import React from "react";
import {
  View,
  // Text,
  StyleSheet,
  // TextInput,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import SelectDropdown from "react-native-select-dropdown";
import CustomText from "@/components/CustomText";
import CustomTextInput from "@/components/\bCustomTextInput";

const Text = CustomText;
const TextInput = CustomTextInput;

interface CustomSelectDropdownProps {
  data: { title: string; desc?: string }[];
  onSelect: (
    item: { title: string } | { title: string; desc?: string }
  ) => void;
  defaultValue: string | undefined;
}

const CustomSelectDropdown: React.FC<CustomSelectDropdownProps> = ({
  data,
  onSelect,
  defaultValue,
}) => {
  return (
    <SelectDropdown
      data={data}
      onSelect={(item) => onSelect(item)}
      renderButton={(selectedItem, isOpened) => (
        <View
          style={{
            flexDirection: "row",
            width: "65%",
            justifyContent: "space-between",
            alignItems: "center",
            borderColor: Colors.light.tint,
            borderWidth: 1,
            height: 30,
            borderRadius: 5,
            paddingHorizontal: 10,
          }}
        >
          <Text>
            {!defaultValue || defaultValue === "undefined" ? "" : defaultValue}
          </Text>
          <AntDesign
            name={isOpened ? "up" : "down"}
            size={18}
            color={Colors.black}
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
  );
};

const makeModalRow = (label: string, value: string | undefined) => {
  return (
    <View style={[styles.rowContainer, { justifyContent: "space-between" }]}>
      <Text style={styles.modalText}>{label}: </Text>
      <TextInput
        style={styles.modalInput}
        value={!value || value === "undefined" ? "" : value}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "space-between",
  },
  modalText: {
    width: "35%",
  },
  modalInput: {
    color: Colors.black,
    borderColor: Colors.light.tint,
    borderWidth: 1,
    height: 30,
    width: "65%",
    borderRadius: 5,
    padding: 5,
    paddingHorizontal: 10,
  },
});

export { CustomSelectDropdown, makeModalRow };
