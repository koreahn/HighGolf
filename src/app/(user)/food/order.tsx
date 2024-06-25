import {
  View,
  // Text,
  StyleSheet,
  ListRenderItemInfo,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import { AntDesign } from "@expo/vector-icons";
import CustomButton from "@/components/CustomButton";
import CustomHeader from "@/components/CustomHeader";
import Colors from "@/constants/Colors";
import { useMenuList } from "@/api/menus";
import LoadingIndicator from "@/components/LodingIndicator";
import { Tables, TablesInsert } from "@/database.types";
import { useInsertBasket, useInsertOrder } from "@/api/orders";
import { useFacilityList } from "@/api/facilities";
import SelectDropdown from "react-native-select-dropdown";
import { useAuthContext } from "@/providers/AuthProvider";
import { useRouter } from "expo-router";
import { confirm } from "@/components/commonFunc";
import { sendPushNotificationToUser } from "@/lib/notifications";
import CustomText from "@/components/CustomText";

const Text = CustomText;

type Menu = Tables<"menus"> & { quantity: number };
type Basket = TablesInsert<"baskets">;
type Facility = Tables<"facilities">;
type Order = Tables<"orders">;

const Order = () => {
  const { user } = useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { data: menusData, error, isLoading } = useMenuList();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [baskets, setBaskets] = useState<Basket[]>([]);

  const { data: facilitiesData, error: facilityError } = useFacilityList();
  const facilities = facilitiesData
    ? facilitiesData?.map((item) => ({
        title: item.display_name,
        facility: item,
      }))
    : [];
  const pmtMthds = [
    { title: "CARD" },
    { title: "UPI" },
    { title: "BANK" },
    { title: "CASH" },
  ];
  const [facility, setFacility] = useState<Facility>();
  const [pmtMthd, setPmtMthd] = useState("");

  const { mutate: insertBasket } = useInsertBasket();
  const { mutate: insertOrder } = useInsertOrder();

  useEffect(() => {
    if (menusData) {
      const menusWithQuantity = menusData.map((menu) => ({
        ...menu,
        quantity: 0,
      }));
      setMenus(menusWithQuantity);
    }
  }, [menusData]);

  const totalPrice = menus.reduce(
    (sum, menus) => sum + menus.quantity * menus.price,
    0
  );

  const onMinus = (menu: Menu) => {
    if (menu.quantity === 0) {
      return;
    }

    setMenus((prevMenus) =>
      prevMenus.map((prevMenu) =>
        prevMenu.menu_id === menu.menu_id
          ? { ...prevMenu, quantity: prevMenu.quantity - 1 }
          : prevMenu
      )
    );

    setBaskets((prevBaskets) => {
      const existingBasket = prevBaskets.find(
        (basket) => basket.menu_id === menu.menu_id
      );

      if (existingBasket) {
        if (existingBasket.quantity === 1) {
          return prevBaskets.filter(
            (basket) => basket.menu_id !== menu.menu_id
          );
        } else {
          return prevBaskets.map((basket) =>
            basket.menu_id === menu.menu_id
              ? { ...basket, quantity: basket.quantity - 1 }
              : basket
          );
        }
      }

      return prevBaskets;
    });
  };

  const onPlus = (menu: Menu) => {
    if (!menu.is_stock) {
      Alert.alert("주문하실 수 없습니다. 카운터에 문의하세요.");
      return;
    }

    setMenus((prevMenus) =>
      prevMenus.map((prevMenu) =>
        prevMenu.menu_id === menu.menu_id
          ? { ...prevMenu, quantity: prevMenu.quantity + 1 }
          : prevMenu
      )
    );

    setBaskets((prevBaskets) => {
      const existingBasket = prevBaskets.find(
        (basket) => basket.menu_id === menu.menu_id
      );

      if (existingBasket) {
        return prevBaskets.map((basket) =>
          basket.menu_id === menu.menu_id
            ? { ...basket, quantity: basket.quantity + 1 }
            : basket
        );
      } else {
        return [
          ...prevBaskets,
          {
            branch_id: 1,
            order_id: 1,
            eng_nm: menu.eng_nm,
            kor_nm: menu.kor_nm,
            menu_id: menu.menu_id,
            price: menu.price,
            quantity: 1,
          },
        ];
      }
    });
  };

  const renderMenus = ({ item: menu }: ListRenderItemInfo<Menu>) => {
    return (
      <View style={styles.menuContainer}>
        <View style={styles.menuName}>
          <Text>{`${menu.kor_nm} - ₹ ${menu.price} Rs`}</Text>
          <Text>
            <Text>({menu.eng_nm})</Text>
            {!menu.is_stock && (
              <Text style={{ color: Colors.red, fontWeight: "bold" }}>
                {` - 매진`}
              </Text>
            )}
          </Text>
        </View>
        <View style={styles.menuQuantity}>
          <TouchableOpacity
            style={styles.priceIcon}
            onPress={() => onMinus(menu)}
          >
            <AntDesign name="minuscircleo" size={30} color={Colors.black} />
          </TouchableOpacity>
          <Text style={styles.price}>{menu.quantity}</Text>
          <TouchableOpacity
            style={styles.priceIcon}
            onPress={() => onPlus(menu)}
          >
            <AntDesign name="pluscircleo" size={30} color={Colors.black} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const onOrderClick = async () => {
    if (!baskets || baskets.length === 0) {
      Alert.alert("주문하실 메뉴를 선택하세요.");
      return;
    }

    if (!facility) {
      Alert.alert("장소를 선택하세요.");
      return;
    }

    if (!pmtMthd) {
      Alert.alert("결재방식을 선택하세요.");
      return;
    }

    if (
      !(await confirm(
        "주문",
        `₹ ${totalPrice} / ${facility.display_name} / ${pmtMthd}\n주문하시겠습니까?`
      ))
    ) {
      return;
    }

    insertOrder(
      {
        branch_id: 1,
        user_id: user.user_id,
        user_name: user.user_name,
        facility_id: facility.facility_id,
        display_name: facility.display_name,
        pmt_mthd: pmtMthd,
        total_price: totalPrice,
        status: "ORDERED",
      },
      {
        onSuccess: (newOrder) => {
          insertBaskets(newOrder.order_id);
          // Alert.alert("The menu has been saved.");
          // if (newOrder) insertBaskets(newOrder.order_id);
        },
      }
    );
  };

  const insertBaskets = (order_id: number) => {
    for (const basket of baskets) {
      insertBasket(
        {
          branch_id: 1,
          order_id: order_id,
          menu_id: basket.menu_id,
          kor_nm: basket.kor_nm,
          eng_nm: basket.eng_nm,
          price: basket.price,
          quantity: basket.quantity,
        },
        {
          onSuccess: () => {
            sendPushNotificationToUser(
              "Ordering food",
              "The user ordered the food.",
              "myapp://admin/status/order"
            );
            Alert.alert("주문 요청 되었습니다.");
            router.push("/(user)/");
          },
        }
      );
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader headerTtitle="음료 & 스낵 주문" />
      <FlatList
        keyboardShouldPersistTaps={"handled"}
        style={{ width: "100%" }}
        data={menus}
        renderItem={renderMenus}
        keyExtractor={(menu) => menu.menu_id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={{ marginTop: 30, alignItems: "center" }}>
            <Text style={{ fontSize: 16, color: Colors.gray }}>
              No menus found
            </Text>
          </View>
        )}
      />
      <View style={[styles.rowContainer, { marginBottom: 10 }]}>
        <Text style={{ width: "35%" }}>장소: </Text>
        <SelectDropdown
          data={facilities}
          onSelect={(item) => setFacility(item.facility)}
          defaultValue={"ALL"}
          renderButton={(selectedItem, isOpened) => {
            return (
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
                <Text style={{ fontSize: 12 }}>
                  {selectedItem ? selectedItem.title : "ALL"}
                </Text>
                <AntDesign
                  name={isOpened ? "up" : "down"}
                  size={14}
                  color={Colors.black}
                />
              </View>
            );
          }}
          renderItem={(item, index, isSelected) => {
            return (
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
            );
          }}
          showsVerticalScrollIndicator={false}
          dropdownStyle={{ borderRadius: 8 }}
        />
      </View>
      <View style={styles.rowContainer}>
        <Text style={{ width: "35%" }}>결재 방식: </Text>
        <SelectDropdown
          data={pmtMthds}
          onSelect={(item) => setPmtMthd(item.title)}
          defaultValue={"ALL"}
          renderButton={(selectedItem, isOpened) => {
            return (
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
                <Text style={{ fontSize: 12 }}>
                  {selectedItem ? selectedItem.title : "ALL"}
                </Text>
                <AntDesign
                  name={isOpened ? "up" : "down"}
                  size={14}
                  color={Colors.black}
                />
              </View>
            );
          }}
          renderItem={(item, index, isSelected) => {
            return (
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
            );
          }}
          showsVerticalScrollIndicator={false}
          dropdownStyle={{ borderRadius: 8 }}
        />
      </View>
      <CustomButton text={`주문 (₹ ${totalPrice})`} onPress={onOrderClick} />
      {(loading || isLoading) && <LoadingIndicator />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
    justifyContent: "space-between",
  },
  menuContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    gap: 20,
  },
  menuName: {
    width: "60%",
    borderWidth: 1,
    borderColor: Colors.gray,
    borderRadius: 10,
    alignItems: "center",
    padding: 7,
  },
  menuQuantity: {
    flexDirection: "row",
    width: "35%",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceIcon: {
    // flex: 1,
  },
  price: {
    // flex: 1,
    fontSize: 30,
    fontWeight: "200",
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default Order;
