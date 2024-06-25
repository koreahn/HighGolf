import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsertTables, UpdateTables } from "@/types";

export const useUserMbrList = () => {
  return useQuery({
    queryKey: ["user_mbrs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_mbrs")
        .select("*")
        .order("user_mbr_id", { ascending: true });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useInsertUserMbr = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: InsertTables<"user_mbrs">) {
      const { error, data: newUserMbr } = await supabase
        .from("user_mbrs")
        .insert({
          branch_id: 1,
          user_id: data.user_id,
          mbr_id: data.mbr_id,
          mbr_type: data.mbr_type,
          mbr_name: data.mbr_name,
          nick: data.nick,
          division: data.division,
          status: data.status,
          pmt_amt: data.pmt_amt,
          pending_amt: data.pending_amt,
          pmt_dt: data.pmt_dt,
          pmt_mthd: data.pmt_mthd,
          join_dt: data.join_dt,
          finish_dt: data.finish_dt,
          stop_cnt: data.stop_cnt,
          stopped_cnt: data.stopped_cnt,
          stop_desc: data.stop_desc,
          stop_dt: data.stop_dt,
          start_dt: data.start_dt,
        })
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return newUserMbr;
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ["useUsersWithMbr"] });
    },
  });
};

export const useUpdateUserMbr = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn({
      id,
      updatedFields,
    }: {
      id: number;
      updatedFields: UpdateTables<"user_mbrs">;
    }) {
      const { data: existingData, error: fetchError } = await supabase
        .from("user_mbrs")
        .select("stopped_cnt")
        .eq("user_mbrs_id", id)
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const newStoppedCnt =
        (existingData.stopped_cnt === null ? 0 : existingData.stopped_cnt) +
        (!updatedFields.stopped_cnt ? 0 : updatedFields.stopped_cnt);

      const { error, data: updatedUserMbr } = await supabase
        .from("user_mbrs")
        .update({
          status: updatedFields.status,
          pmt_amt: updatedFields.pmt_amt,
          pending_amt: updatedFields.pending_amt,
          pmt_dt: updatedFields.pmt_dt,
          stop_dt: updatedFields.stop_dt,
          start_dt: updatedFields.start_dt,
          stopped_cnt: newStoppedCnt,
          finish_dt: updatedFields.finish_dt,
        })
        .eq("user_mbrs_id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return updatedUserMbr;
    },
    async onSuccess(updatedUserMbr) {
      await queryClient.invalidateQueries({ queryKey: ["useUsersWithMbr"] });
    },
  });
};
