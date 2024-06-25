import React from "react";
import {
  View,
  // Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Colors from "@/constants/Colors";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { getFormatDate } from "@/components/commonFunc";
import CustomText from "@/components/CustomText";

const Text = CustomText;

interface DatePickerProps {
  selectedDate: string;
  currIndex: number;
  dates: string[];
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
  setCurrIndex: React.Dispatch<React.SetStateAction<number>>;
  nextCallBack?: () => void;
  prevCallBack?: () => void;
}

interface CalendarPickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

const DatePicker: React.FC<DatePickerProps> = ({
  selectedDate,
  currIndex,
  dates,
  setSelectedDate,
  setCurrIndex,
  nextCallBack,
  prevCallBack,
}) => {
  return (
    <View style={styles.dateContainer}>
      <TouchableOpacity
        onPress={() => {
          setSelectedDate(dates[Math.max(0, currIndex - 1)]);
          setCurrIndex((prevIndex) => Math.max(0, prevIndex - 1));

          prevCallBack && prevCallBack();
        }}
        disabled={currIndex === 0}
        style={{ flex: 1 }}
      >
        {currIndex === 0 ? null : (
          <MaterialIcons
            name="keyboard-double-arrow-left"
            size={28}
            color={Colors.black}
          />
        )}
      </TouchableOpacity>
      <View style={styles.date}>
        <Text style={styles.dateText}>{selectedDate}</Text>
      </View>
      <TouchableOpacity
        onPress={() => {
          setSelectedDate(dates[Math.min(dates.length - 1, currIndex + 1)]);
          setCurrIndex((prevIndex) =>
            Math.min(dates.length - 1, prevIndex + 1)
          );

          nextCallBack && nextCallBack();
        }}
        disabled={currIndex === dates.length - 1}
        style={{ flex: 1 }}
      >
        {currIndex === dates.length - 1 ? null : (
          <MaterialIcons
            name="keyboard-double-arrow-right"
            size={28}
            color={Colors.black}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const getDates = (): string[] => {
  const today = new Date();
  const stdDates = [];
  for (let i = 0; i < 14; i++) {
    const currentDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    if (i === 0 && currentDate.getHours() >= 23) {
      continue;
    }
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    stdDates.push(`${year}-${month}-${day}`);
  }

  return stdDates;
};

const CalendarPicker: React.FC<CalendarPickerProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const [showPicker, setShowPicker] = React.useState(false);

  const togglePicker = () => {
    setShowPicker((prev) => !prev);
  };

  const handleConfirm = (date: Date) => {
    togglePicker();
    onDateChange(date);
  };

  return (
    <View>
      <TouchableOpacity style={styles.rowContainer} onPress={togglePicker}>
        <Text style={[styles.labelText, { marginRight: 10 }]}>
          {getFormatDate(selectedDate)}
        </Text>
        <DateTimePickerModal
          isVisible={showPicker}
          mode="date"
          date={selectedDate}
          onConfirm={handleConfirm}
          onCancel={togglePicker}
        />
        <MaterialIcons name="edit-calendar" size={24} color={Colors.black} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  date: {
    flex: 10,
    alignItems: "center",
  },
  rowContainer: {
    flexDirection: "row",
    // alignItems: "center",
    marginBottom: 10,
  },
  labelText: {
    fontSize: 18,
    fontWeight: "600",
  },
});

export default DatePicker;
export { CalendarPicker, getDates };
