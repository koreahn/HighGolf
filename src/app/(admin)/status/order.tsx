import {
  View,
  // Text,
  StyleSheet,
  FlatList,
  ListRenderItem,
  Alert,
} from "react-native";
import React, { useEffect, useState } from "react";
import CustomHeader from "@/components/CustomHeader";
import Colors from "@/constants/Colors";
import { CalendarPicker } from "@/components/DatePicker";
import SelectDropdown from "react-native-select-dropdown";
import { AntDesign } from "@expo/vector-icons";
import {
  confirm,
  getFormatDate,
  getFormatDateTime,
} from "@/components/commonFunc";
import { Tables } from "@/database.types";
import { supabase } from "@/lib/supabase";
import LoadingIndicator from "@/components/LodingIndicator";
import { sendPushNotificationToUser } from "@/lib/notifications";
import CustomText from "@/components/CustomText";

const Text = CustomText;

type Order = Tables<"orders">;
type Basket = Tables<"baskets">;

type OrderWithBaskets = {
  order: Order;
  baskets: Basket[];
};

const OrderStatus = () => {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersWithBaskets, setOrdersWithBaskets] = useState<
    OrderWithBaskets[]
  >([]);

  useEffect(() => {
    getOrders();
  }, [selectedDate]);

  useEffect(() => {
    if (orders.length > 0) {
      getBaskets();
    } else {
      setOrdersWithBaskets([]);
    }
  }, [orders]);

  const getOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", `${getFormatDate(selectedDate)}T00:00:00.000Z`)
        .order("order_id", { ascending: false });
      if (error) {
        throw new Error(error.message);
      }
      setOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const getBaskets = async () => {
    try {
      setLoading(true);
      const ordersWithBaskets: OrderWithBaskets[] = [];

      for (const order of orders) {
        const { data: baskets, error } = await supabase
          .from("baskets")
          .select("*")
          .eq("order_id", order.order_id)
          .order("basket_id", { ascending: true });

        if (error) {
          throw new Error(error.message);
        }

        ordersWithBaskets.push({ order, baskets });
      }

      setOrdersWithBaskets(ordersWithBaskets);
    } catch (err) {
      console.error("Error fetching baskets:", err);
    } finally {
      setLoading(false);
    }
  };

  const onChangeStatus = async (status: { title: string }, order: Order) => {
    if (status.title === order.status) return;
    const title = status.title;
    const message = `Would you like to change the order status to ${status.title}?`;
    if (!(await confirm(title, message))) return order.status;

    try {
      setLoading(true);
      const { error, data: updatedOrder } = await supabase
        .from("orders")
        .update({
          status: status.title,
        })
        .eq("order_id", order.order_id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      getOrders();
      Alert.alert("Order status has been changed.");

      const body =
        updatedOrder.status === "PREPARING"
          ? "Your order is being prepared."
          : updatedOrder.status === "COMPLETED(NOT PAID)"
          ? "Your order is complete.\nPlease proceed with payment."
          : updatedOrder.status === "COMPLETED"
          ? "Your order has been completed."
          : "Your order has been cancelled.\nPlease inquire at the counter.";
      sendPushNotificationToUser(
        "Order",
        body,
        "myapp://user/food/orderStatus",
        updatedOrder.user_id
      );
    } catch (err) {
      console.error("Error changing order status:", err);
    } finally {
      setLoading(false);
    }
  };

  const rederOrders: ListRenderItem<OrderWithBaskets> = ({ item }) => {
    return (
      <View
        style={[
          styles.orderContainer,
          {
            backgroundColor:
              item.order.status === "COMPLETED" ||
              item.order.status === "CANCELED"
                ? Colors.lightgray
                : Colors.white,
          },
        ]}
      >
        <View style={styles.rowContainer}>
          <Text style={{ fontSize: 14, fontWeight: "600" }}>
            {item.order.display_name
              ? `${item.order.display_name} (${item.order.user_name})`
              : item.order.user_name}
          </Text>
        </View>
        <View
          style={[styles.rowContainer, { justifyContent: "space-between" }]}
        >
          <Text style={{ fontSize: 14, fontWeight: "600" }}>
            {`₹${item.order.total_price} (${item.order.pmt_mthd})`}
          </Text>
          <Text style={{ fontSize: 12, fontWeight: "500" }}>
            {getFormatDateTime(
              !item.order.created_at ? new Date() : item.order.created_at
            )}
          </Text>
        </View>

        <View style={styles.basketContainer}>
          {item.baskets.map((basket, idx) => (
            <View
              key={idx}
              style={[styles.rowContainer, { justifyContent: "space-between" }]}
            >
              <Text>
                &#8226;{" "}
                {`${basket.eng_nm} (₹${basket.price}) * ${basket.quantity}`}
              </Text>
              <Text>₹ {basket.price * basket.quantity}</Text>
            </View>
          ))}
        </View>

        <SelectDropdown
          data={[
            { title: "ORDERED" },
            { title: "PREPARING" },
            { title: "COMPLETED(NOT PAID)" },
            { title: "COMPLETED" },
            { title: "CANCELED" },
          ]}
          onSelect={(status) => onChangeStatus(status, item.order)}
          disabled={
            item.order.status === "COMPLETED" ||
            item.order.status === "CANCELED"
          }
          renderButton={(selectedItem, isOpened) => {
            return (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  borderColor: Colors.light.tint,
                  backgroundColor: Colors.light.tint,
                  borderWidth: 1,
                  height: 30,
                  borderRadius: 5,
                }}
              >
                <Text style={{ color: Colors.white }}>
                  {selectedItem ? selectedItem.title : item.order.status}
                </Text>
                {item.order.status !== "COMPLETED" &&
                  item.order.status !== "CANCELED" && (
                    <AntDesign
                      name={isOpened ? "up" : "down"}
                      size={18}
                      color={Colors.white}
                    />
                  )}
              </View>
            );
          }}
          renderItem={(item, index, isSelected) => {
            return (
              <View
                style={{
                  ...styles.dropdownItemStyle,
                  ...(isSelected && { backgroundColor: "#D2D9DF" }),
                }}
              >
                <Text style={styles.dropdownItemTxtStyle}>{item.title}</Text>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
          dropdownStyle={styles.dropdownMenuStyle}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader headerTtitle="Order Status" path="/" />
      <View style={{ flex: 1 }}>
        <CalendarPicker
          selectedDate={selectedDate}
          onDateChange={(date) => setSelectedDate(date)}
        />
      </View>
      <View style={{ flex: 9 }}>
        <FlatList
          keyboardShouldPersistTaps={"handled"}
          style={{ width: "100%" }}
          data={ordersWithBaskets}
          renderItem={rederOrders}
          keyExtractor={(order) => order.order.order_id.toString()}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={{ marginTop: 30, alignItems: "center" }}>
              <Text style={{ fontSize: 16, color: Colors.gray }}>
                No orders found
              </Text>
            </View>
          )}
        />
      </View>
      {loading && <LoadingIndicator />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
  },
  rowContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  orderContainer: {
    borderWidth: 1,
    borderColor: Colors.gray,
    marginVertical: 10,
    padding: 10,
    borderRadius: 10,
  },
  basketContainer: {
    padding: 10,
  },

  dropdownButtonStyle: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 30,
  },
  dropdownItemStyle: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  dropdownMenuStyle: {
    borderRadius: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 14,
    color: Colors.black,
  },
});

export default OrderStatus;
