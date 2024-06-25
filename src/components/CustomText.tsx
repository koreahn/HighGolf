import React from "react";
import { Text as RNText, TextProps, StyleProp, TextStyle } from "react-native";

interface CustomTextProps extends TextProps {
  allowFontScaling?: boolean;
  style?: StyleProp<TextStyle>;
}

const CustomText: React.FC<CustomTextProps> = ({
  allowFontScaling = false,
  style,
  ...props
}) => {
  return (
    <RNText allowFontScaling={allowFontScaling} style={style} {...props} />
  );
};

export default CustomText;
