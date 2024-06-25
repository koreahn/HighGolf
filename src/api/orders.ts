import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsertTables, UpdateTables } from "@/types";

export const useOrderList = (toDay: string) => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .gte("created_at", new Date(`${toDay}00:00`))
        .lt("created_at", new Date(`${toDay}23:59`))
        .order("order_id", { ascending: false });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useBasketList = (order_id: number) => {
  return useQuery({
    queryKey: ["baskets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("baskets")
        .select("*")
        .eq("order_id", order_id)
        .order("order_id", { ascending: false });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useInsertBasket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: InsertTables<"baskets">) {
      const { error, data: newBasket } = await supabase
        .from("baskets")
        .insert({
          branch_id: data.branch_id,
          order_id: data.order_id,
          menu_id: data.menu_id,
          kor_nm: data.kor_nm,
          eng_nm: data.eng_nm,
          price: data.price,
          quantity: data.quantity,
        })
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return newBasket;
    },
    async onSuccess() {
      //   await queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });
};

export const useInsertOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: InsertTables<"orders">) {
      const { error, data: newOrder } = await supabase
        .from("orders")
        .insert({
          branch_id: data.branch_id,
          user_id: data.user_id,
          user_name: data.user_name,
          facility_id: data.facility_id,
          display_name: data.display_name,
          pmt_mthd: data.pmt_mthd,
          total_price: data.total_price,
          status: data.status,
          description: data.description,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return newOrder;
    },
    async onSuccess(newOrder) {
      await queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useOrderStatusCnt = () => {
  return useQuery({
    queryKey: ["useOrderStatusCnt"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_order_status_cnt");

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useOrderStatusCntByUser = (userId: number) => {
  return useQuery({
    queryKey: ["useOrderStatusCnt", userId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_order_status_cnt_user", {
        p_user_id: userId,
      });

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};
