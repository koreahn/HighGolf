import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsertTables, UpdateTables } from "@/types";

export const useStdDataList = () => {
  return useQuery({
    queryKey: ["codes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("codes").select("*");
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useUpdateStdData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn({
      group,
      code,
      updatedFields,
    }: {
      group: string;
      code: string;
      updatedFields: UpdateTables<"codes">;
    }) {
      const { error, data: updatedCode } = await supabase
        .from("codes")
        .update({
          code_val: updatedFields.code_val,
        })
        .eq("group_cd", group)
        .eq("code_cd", code)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return updatedCode;
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ["codes"] });
    },
  });
};
