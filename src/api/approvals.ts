import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsertTables, UpdateTables } from "@/types";

export const useApprovalList = () => {
  return useQuery({
    queryKey: ["approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("approvals")
        .select("*")
        .eq("appr_stts", "PROGRESS")
        .order("appr_id", { ascending: true });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useApprovalByDateList = (date: string) => {
  return useQuery({
    queryKey: ["approvals", date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("approvals")
        .select("*")
        .eq("appr_stts", "PROGRESS")
        .eq("appr_dt", date)
        .order("appr_id", { ascending: true });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useInsertApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: InsertTables<"approvals">) {
      const { error, data: newApproval } = await supabase
        .from("approvals")
        .insert({
          branch_id: data.branch_id,
          appr_type: data.appr_type,
          type_id: data.type_id,
          user_id: data.user_id,
          user_name: data.user_name,
          appr_stts: data.appr_stts,
          appr_dt: data.appr_dt,
          std_dt: data.std_dt,
          std_start_tm: data.std_start_tm,
          std_end_tm: data.std_end_tm,
          stop_dt: data.stop_dt,
          start_dt: data.start_dt,
          comments: data.comments,
          create_id: data.create_id,
          update_id: data.update_id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return newApproval;
    },
    async onSuccess(_, { appr_dt }) {
      await queryClient.invalidateQueries({ queryKey: ["approvals"] });
      await queryClient.invalidateQueries({ queryKey: ["approvals", appr_dt] });
    },
  });
};

export const useUpdateApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn({
      id,
      updatedFields,
    }: {
      id: number;
      updatedFields: UpdateTables<"approvals">;
    }) {
      const { error, data: updatedApproval } = await supabase
        .from("approvals")
        .update({
          appr_stts: updatedFields.appr_stts,
          comments: updatedFields.comments,
          update_id: updatedFields.update_id,
          updated_at: new Date().toISOString(),
        })
        .eq("appr_id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return updatedApproval;
    },
    async onSuccess(_, { updatedFields }) {
      await queryClient.invalidateQueries({ queryKey: ["approvals"] });
      await queryClient.invalidateQueries({
        queryKey: ["approvals", updatedFields.appr_dt],
      });
    },
  });
};

export const useUpdateApprovalByType = () => {
  return useMutation({
    async mutationFn({
      appr_stts,
      appr_type,
      type_id,
      user_id,
    }: {
      appr_stts: string;
      appr_type: string;
      type_id: number;
      user_id: number;
    }) {
      const { error, data } = await supabase.rpc("update_approvals", {
        p_status: appr_stts,
        p_type: appr_type,
        p_type_id: type_id,
        p_user_id: user_id,
      });

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};
