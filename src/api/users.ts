import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsertTables, UpdateTables } from "@/types";

export const useUserList = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("user_id", { ascending: true });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("user_id", id)
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useInsertUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: InsertTables<"users">) {
      const { error, data: newUser } = await supabase
        .from("users")
        // .insert(data)
        .insert({
          branch_id: 1,
          id: data.id,
          token: data.token,
          user_type: data.user_type,
          branch_name: data.branch_name,
          user_name: data.user_name,
          contact: data.contact,
          description: data.description,
        })
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return newUser;
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn({
      id,
      updatedFields,
    }: {
      id: number;
      updatedFields: UpdateTables<"users">;
    }) {
      const { error, data: updatedUser } = await supabase
        .from("users")
        .update({
          token: updatedFields.token,
          user_type: updatedFields.user_type,
          branch_name: updatedFields.branch_name,
          user_name: updatedFields.user_name,
          contact: updatedFields.contact,
          description: updatedFields.description,
        })
        .eq("user_id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return updatedUser;
    },
    async onSuccess(_, { id }) {
      await queryClient.invalidateQueries({ queryKey: ["useUsersWithMbr"] });
      await queryClient.invalidateQueries({ queryKey: ["useUserWithMbr"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(id: number) {
      const { error } = await supabase.from("users").delete().eq("user_id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUserWithMbr = (id: string) => {
  const user_id_param = id;
  return useQuery({
    queryKey: ["useUserWithMbr", id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_user_and_latest_membership",
        { p_id: id }
      );

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useUsersWithMbr = () => {
  return useQuery({
    queryKey: ["useUsersWithMbr"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc(
        "get_users_and_latest_membership"
      );

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useUserMbrCnt = () => {
  return useQuery({
    queryKey: ["useUserMbrCnt"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_users_mbrs_cnt");

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};
