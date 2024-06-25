import { StyleSheet, View, ActivityIndicator, Text } from "react-native";

const LoadingIndicator = () => {
  return (
    <View style={{ ...styles.indicatorWrapper, ...styles.overlay }}>
      <ActivityIndicator
        size="large"
        color="#ffffff"
        style={styles.indicator}
      />
      <Text style={styles.indicatorText}></Text>
    </View>
  );
};

const styles = StyleSheet.create({
  indicatorWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  indicator: {},
  indicatorText: {
    fontSize: 18,
    marginTop: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default LoadingIndicator;
