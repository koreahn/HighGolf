import React from "react";
import { TextInput as RNTextInput, TextInputProps } from "react-native";

interface CustomTextInputProps extends TextInputProps {
  allowFontScaling?: boolean;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  allowFontScaling = false,
  ...props
}) => {
  return <RNTextInput allowFontScaling={allowFontScaling} {...props} />;
};

export default CustomTextInput;
