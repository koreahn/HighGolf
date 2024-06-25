import { Alert } from "react-native";
import React from "react";

export const confirm = (
  title: string,
  message: string,
  okText?: string,
  cancelText?: string
) => {
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      {
        text: cancelText ? cancelText : "Cancel",
        style: "cancel",
        onPress: () => resolve(false),
      },
      {
        text: okText ? okText : "OK",
        onPress: () => resolve(true),
      },
    ]);
  });
};

export const getFormatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getFormatDateTime = (input: Date | string): string => {
  let date: Date;

  if (typeof input === "string") {
    date = new Date(input);
  } else {
    date = input;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

export const addDate = (
  date: Date | string,
  std: string,
  add: number
): string => {
  const stdDate = typeof date === "string" ? new Date(date) : date;

  if (std === "month") {
    const newMonth = stdDate.getMonth() + add;
    const newYear = stdDate.getFullYear() + Math.floor(newMonth / 12);
    const remainderMonth = newMonth % 12;
    return getFormatDate(new Date(newYear, remainderMonth, stdDate.getDate()));
  } else if (std === "day") {
    return getFormatDate(
      new Date(stdDate.getTime() + add * 24 * 60 * 60 * 1000)
    );
  } else {
    return "";
  }
};

export const daysDifference = (fromDate: string, toDate: string): number => {
  const fromDateObj = new Date(fromDate);
  const toDateObj = new Date(toDate);

  const timeDiff = Math.abs(toDateObj.getTime() - fromDateObj.getTime());
  const dayDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return dayDiff;
};

export const addDaysToDate = (dateStr: string, days: number): string => {
  const dateObj = new Date(dateStr);

  dateObj.setDate(dateObj.getDate() + days);

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
