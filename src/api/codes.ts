import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsertTables, UpdateTables } from "@/types";

export const useCodeList = () => {
  return useQuery({
    queryKey: ["codes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("codes")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useCode = (group: string, code: string) => {
  return useQuery({
    queryKey: ["codes", group, code],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("codes")
        .select("code_val")
        .eq("group_cd", group)
        .eq("code_cd", code)
        .order("created_at", { ascending: true });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};
