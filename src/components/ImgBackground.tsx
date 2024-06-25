import { ImageBackground } from "react-native";

const ImgBackground = () => {
  return (
    <ImageBackground
      style={{
        width: "100%",
        height: "100%",
        flex: 1,
        opacity: 1,
        position: "absolute",
        top: 0,
        left: 20,
        right: 0,
        bottom: 0,
      }}
      source={require("@assets/images/logo.jpeg")}
      resizeMode="contain"
    />
  );
};

export default ImgBackground;
