import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsertTables, UpdateTables } from "@/types";

export const useMembershipList = () => {
  return useQuery({
    queryKey: ["memberships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memberships")
        .select("*")
        .order("mbr_id", { ascending: true });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useMembership = (id: number) => {
  return useQuery({
    queryKey: ["memberships", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memberships")
        .select("*")
        .eq("mbr_id", id)
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useInsertMembership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: InsertTables<"memberships">) {
      const { error, data: newMembership } = await supabase
        .from("memberships")
        // .insert(data)
        .insert({
          branch_id: 1,
          mbr_type: data.mbr_type,
          mbr_name: data.mbr_name,
          nick: data.nick,
          division: data.division,
          price: data.price,
          stop_cnt: data.stop_cnt,
          lesson_min: data.lesson_min,
          lesson_cnt: data.lesson_cnt,
          description: data.description,
        })
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return newMembership;
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ["memberships"] });
    },
  });
};

export const useUpdateMembership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn({
      id,
      updatedFields,
    }: {
      id: number;
      updatedFields: UpdateTables<"memberships">;
    }) {
      const { error, data: updatedMembership } = await supabase
        .from("memberships")
        .update({
          branch_id: 1,
          mbr_type: updatedFields.mbr_type,
          mbr_name: updatedFields.mbr_name,
          nick: updatedFields.nick,
          division: updatedFields.division,
          price: updatedFields.price,
          stop_cnt: updatedFields.stop_cnt,
          lesson_min: updatedFields.lesson_min,
          lesson_cnt: updatedFields.lesson_cnt,
          description: updatedFields.description,
        })
        .eq("mbr_id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return updatedMembership;
    },
    async onSuccess(_, { id }) {
      await queryClient.invalidateQueries({ queryKey: ["memberships"] });
      await queryClient.invalidateQueries({ queryKey: ["memberships", id] });
    },
  });
};

export const useDeleteMembership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn({ id }: { id: number }) {
      const { error } = await supabase
        .from("memberships")
        .delete()
        .eq("mbr_id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ["memberships"] });
    },
  });
};
