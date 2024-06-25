import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsertTables, UpdateTables } from "@/types";

export const useMenuList = () => {
  return useQuery({
    queryKey: ["menus"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menus")
        .select("*")
        .order("menu_id", { ascending: true });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useMenu = (id: number) => {
  return useQuery({
    queryKey: ["menus", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menus")
        .select("*")
        .eq("menu_id", id)
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useInsertMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: InsertTables<"menus">) {
      const { error, data: newMenu } = await supabase
        .from("menus")
        // .insert(data)
        .insert({
          branch_id: data.branch_id,
          kor_nm: data.kor_nm,
          eng_nm: data.eng_nm,
          price: data.price,
          is_stock: data.is_stock,
          description: data.description,
        })
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return newMenu;
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });
};

export const useUpdateMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn({
      id,
      updatedFields,
    }: {
      id: number;
      updatedFields: UpdateTables<"menus">;
    }) {
      const { error, data: updatedMenu } = await supabase
        .from("menus")
        .update({
          kor_nm: updatedFields.kor_nm,
          eng_nm: updatedFields.eng_nm,
          price: updatedFields.price,
          is_stock: updatedFields.is_stock,
          description: updatedFields.description,
        })
        .eq("menu_id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return updatedMenu;
    },
    async onSuccess(_, { id }) {
      await queryClient.invalidateQueries({ queryKey: ["menus"] });
      await queryClient.invalidateQueries({ queryKey: ["menus", id] });
    },
  });
};

export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn({
      id,
      updatedFields,
    }: {
      id: number;
      updatedFields: UpdateTables<"menus">;
    }) {
      const { error, data: updatedMenu } = await supabase
        .from("menus")
        .update({
          is_stock: updatedFields.is_stock,
        })
        .eq("menu_id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return updatedMenu;
    },
    async onSuccess(_, { id }) {
      await queryClient.invalidateQueries({ queryKey: ["menus"] });
      await queryClient.invalidateQueries({ queryKey: ["menus", id] });
    },
  });
};

export const useDeleteMenu = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(id: number) {
      const { error } = await supabase.from("menus").delete().eq("menu_id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ["menus"] });
    },
  });
};
