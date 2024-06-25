import {
  View,
  // Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ListRenderItemInfo,
} from "react-native";
import React, { useState } from "react";
import Colors from "@/constants/Colors";
import CustomHeader from "@/components/CustomHeader";
import CustomButton from "@/components/CustomButton";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useFacilityList } from "@/api/facilities";
import { Tables } from "@/database.types";
import LoadingIndicator from "@/components/LodingIndicator";
import CustomText from "@/components/CustomText";

const Text = CustomText;

type Facility = Tables<"facilities">;

const ManageFacilities = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: facilities, error, isLoading } = useFacilityList();

  const renderFacility = ({ item: facility }: ListRenderItemInfo<Facility>) => {
    return (
      <View style={styles.facilityContainer}>
        <View style={styles.rowContainer}>
          <Text style={{ fontSize: 14 }}>
            {`${facility.facility_type} - ${facility.display_name} / `}
            <Text
              style={{
                color: facility.is_available ? "black" : "red",
                fontWeight: facility.is_available ? "normal" : "bold",
              }}
            >
              {facility.is_available ? "Available" : "Unavailable"}
            </Text>
          </Text>
          <TouchableOpacity
            style={styles.rowContainer}
            onPress={() =>
              router.push({
                pathname: "/(admin)/manage/manageFacility",
                params: {
                  facility_id: facility.facility_id,
                  facility_type: facility.facility_type,
                  display_name: facility.display_name,
                  start_tm: facility.start_tm,
                  end_tm: facility.end_tm,
                  is_available: String(facility.is_available),
                  order: String(facility.order),
                  description: facility.description ? facility.description : "",
                },
              })
            }
          >
            <Text style={{ fontSize: 14 }}>Edit </Text>
            <AntDesign name="arrowright" size={20} color={Colors.black} />
          </TouchableOpacity>
        </View>
        {facility.description && (
          <View style={styles.rowContainer}>
            <Text>{`${facility.description}`}</Text>
          </View>
        )}
      </View>
    );
  };

  const onSelect = (
    item: { title: string } | { title: string; desc?: string }
  ) => {};

  return (
    <View style={styles.container}>
      <CustomHeader headerTtitle="Manage Facilities" />
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View style={{ flex: 9 }}>
          <FlatList
            keyboardShouldPersistTaps={"handled"}
            style={{ width: "100%" }}
            data={facilities}
            renderItem={renderFacility}
            keyExtractor={(facility) => facility.facility_id.toString()}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={{ marginTop: 30, alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: Colors.gray }}>
                  No facilities found
                </Text>
              </View>
            )}
          />
        </View>
        <View style={{ flex: 1 }}>
          <CustomButton
            text="New Facility"
            onPress={() =>
              router.push({
                pathname: "/(admin)/manage/manageFacility",
                params: {
                  facility_id: -1,
                },
              })
            }
          />
        </View>
      </View>
      {(loading || isLoading) && <LoadingIndicator />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
  },
  facilityContainer: {
    borderWidth: 1,
    borderColor: Colors.gray,
    marginVertical: 10,
    padding: 10,
    borderRadius: 10,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "space-between",
  },
});

export default ManageFacilities;
