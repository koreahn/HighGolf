import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsertTables, UpdateTables } from "@/types";

export const useBookingList = (type: string, booking_dt: string) => {
  return useQuery({
    queryKey: ["booking_status", booking_dt],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_status")
        .select("*")
        .eq("booking_dt", booking_dt)
        .in("status", ["BOOKED", "WAITING"])
        .eq("booking_type", type)
        .order("facility_id", { ascending: true });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useBookingByUserList = (id: number, booking_dt: string) => {
  return useQuery({
    queryKey: ["booking_status", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_status")
        .select("*")
        .eq("user_id", id)
        .gte("booking_dt", booking_dt)
        .in("status", ["BOOKED", "WAITING"])
        .order("facility_id", { ascending: true });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useInsertBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: InsertTables<"booking_status">) {
      const { error, data: newBooking } = await supabase
        .from("booking_status")
        .insert({
          branch_id: 1,
          booking_type: data.booking_type,
          user_id: data.user_id,
          user_name: data.user_name,
          facility_id: data.facility_id,
          display_name: data.display_name,
          booking_dt: data.booking_dt,
          start_tm: data.start_tm,
          end_tm: data.end_tm,
          player_cnt: data.player_cnt,
          status: data.status,
          member: data.member,
          description: data.description,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return newBooking;
    },
    // async onSuccess(_, { booking_dt, user_id: id }) {
    async onSuccess(newBooking) {
      await queryClient.invalidateQueries({
        queryKey: ["booking_status", newBooking.booking_dt],
      });
      await queryClient.invalidateQueries({
        queryKey: ["booking_status", newBooking.user_id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["useBookingStatusCnt"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["useUserBookingStatusCnt", newBooking.user_id],
      });
    },
  });
};

export const useUpdateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn({
      id,
      updatedFields,
    }: {
      id: number;
      updatedFields: UpdateTables<"booking_status">;
    }) {
      const { error, data: updatedBooking } = await supabase
        .from("booking_status")
        .update({
          status: updatedFields.status,
          description: updatedFields.description,
        })
        .eq("booking_id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return updatedBooking;
    },
    async onSuccess(updatedBooking) {
      await queryClient.invalidateQueries({
        queryKey: ["booking_status", updatedBooking.booking_dt],
      });
      await queryClient.invalidateQueries({
        queryKey: ["booking_status", updatedBooking.user_id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["useBookingStatusCnt"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["useUserBookingStatusCnt", updatedBooking.user_id],
      });
    },
  });
};

export const useBookingStatusCnt = () => {
  return useQuery({
    queryKey: ["useBookingStatusCnt"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_booking_status_cnt");

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useUserBookingStatusCnt = (user_id: number) => {
  return useQuery({
    queryKey: ["useUserBookingStatusCnt", user_id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_user_booking_status_cnt",
        { p_user_id: user_id }
      );

      if (error) {
        console.error(error);
        throw new Error(error.message);
      }
      return data;
    },
  });
};
