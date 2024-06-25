import { TouchableOpacity, StyleSheet } from "react-native";
import Colors from "../constants/Colors";
import { forwardRef } from "react";
import CustomText from "@/components/CustomText";

const Text = CustomText;

type ButtonProps = {
  text: string;
  bgColor?: string;
  bdColor?: string;
  fgColor?: string;
  opacityNum?: string;
  disabled?: boolean;
} & React.ComponentPropsWithoutRef<typeof TouchableOpacity>;

const CustomButton = forwardRef<TouchableOpacity | null, ButtonProps>(
  (
    {
      text,
      bgColor,
      bdColor,
      fgColor,
      opacityNum,
      disabled = false,
      ...pressableProps
    },
    ref
  ) => {
    return (
      <TouchableOpacity
        ref={ref}
        {...pressableProps}
        disabled={disabled}
        style={[
          styles.container,
          bgColor ? { backgroundColor: bgColor } : {},
          bdColor ? { borderWidth: 1, borderColor: bdColor } : {},
          opacityNum ? { opacity: parseFloat(opacityNum) } : {},
        ]}
      >
        <Text style={[styles.text, { color: fgColor || Colors.white }]}>
          {text}
        </Text>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.tint,
    padding: 15,
    alignItems: "center",
    borderRadius: 100,
    marginVertical: 5,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.white,
  },
});

export default CustomButton;
