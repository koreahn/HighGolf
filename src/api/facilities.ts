import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { InsertTables, UpdateTables } from "@/types";

export const useFacilityList = () => {
  return useQuery({
    queryKey: ["facilities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("facilities")
        .select("*")
        .order("facility_id", { ascending: true });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useFacility = (id: number) => {
  return useQuery({
    queryKey: ["facilities", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("facilities")
        .select("*")
        .eq("facility_id", id)
        .order("order", { ascending: true })
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useFacilityTypeList = (type: string) => {
  return useQuery({
    queryKey: ["facilities", type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("facilities")
        .select("*")
        .eq("facility_type", type)
        .eq("is_available", true)
        .order("order", { ascending: true });
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
  });
};

export const useInsertFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(data: InsertTables<"facilities">) {
      const { error, data: newFacility } = await supabase
        .from("facilities")
        // .insert(data)
        .insert({
          branch_id: 1,
          facility_type: data.facility_type,
          display_name: data.display_name,
          start_tm: data.start_tm,
          end_tm: data.end_tm,
          is_available: data.is_available,
          order: data.order,
          description: data.description,
        })
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return newFacility;
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
  });
};

export const useUpdateFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn({
      id,
      updatedFields,
    }: {
      id: number;
      updatedFields: UpdateTables<"facilities">;
    }) {
      const { error, data: updatedFacility } = await supabase
        .from("facilities")
        .update({
          branch_id: 1,
          facility_type: updatedFields.facility_type,
          display_name: updatedFields.display_name,
          start_tm: updatedFields.start_tm,
          end_tm: updatedFields.end_tm,
          is_available: updatedFields.is_available,
          order: updatedFields.order,
          description: updatedFields.description,
        })
        .eq("facility_id", id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return updatedFacility;
    },
    async onSuccess(_, { id }) {
      await queryClient.invalidateQueries({ queryKey: ["facilities"] });
      await queryClient.invalidateQueries({ queryKey: ["facilities", id] });
    },
  });
};

export const useDeleteFacility = () => {
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn(id: number) {
      const { error } = await supabase
        .from("facilities")
        .delete()
        .eq("facilities_id", id);
      if (error) {
        throw new Error(error.message);
      }
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ["facilities"] });
    },
  });
};
