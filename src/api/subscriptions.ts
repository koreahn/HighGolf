import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/providers/AuthProvider";

export const useOrderInsertSubscription = () => {
  const { user, isAdmin } = useAuthContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    const orderInsertSubscription = supabase
      .channel("custom-insert-channel-order")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          if (user.user_id === payload.new.user_id) {
            queryClient.invalidateQueries({
              queryKey: ["useOrderStatusCnt", user.user_id],
            });
          }

          if (isAdmin)
            queryClient.invalidateQueries({ queryKey: ["useOrderStatusCnt"] });
        }
      )
      .subscribe();

    return () => {
      orderInsertSubscription.unsubscribe();
    };
  }, []);
};

export const useOrderUpdateSubscription = () => {
  const { user, isAdmin } = useAuthContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    const orderUpdateSubscription = supabase
      .channel("custom-update-channel-order")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          if (user.user_id === payload.new.user_id) {
            queryClient.invalidateQueries({
              queryKey: ["useOrderStatusCnt", user.user_id],
            });
          }
          if (isAdmin)
            queryClient.invalidateQueries({ queryKey: ["useOrderStatusCnt"] });
        }
      )
      .subscribe();

    return () => {
      orderUpdateSubscription.unsubscribe();
    };
  }, []);
};

export const useApprInsertSubscription = () => {
  const { user, isAdmin } = useAuthContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    const apprInsertSubscription = supabase
      .channel("custom-insert-channel-appr")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "approvals" },
        (payload) => {
          if (isAdmin)
            queryClient.invalidateQueries({ queryKey: ["approvals"] });
        }
      )
      .subscribe();

    return () => {
      apprInsertSubscription.unsubscribe();
    };
  }, []);
};

export const useApprUpdateSubscription = () => {
  const { user, fetchUser, isAdmin } = useAuthContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    const apprUpdateSubscription = supabase
      .channel("custom-update-channel-appr")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "approvals" },
        (payload) => {
          if (!isAdmin) {
            fetchUser();
            queryClient.invalidateQueries({
              queryKey: ["useUserBookingStatusCnt", user.user_id],
            });
          }
          if (isAdmin)
            queryClient.invalidateQueries({ queryKey: ["approvals"] });
        }
      )
      .subscribe();

    return () => {
      apprUpdateSubscription.unsubscribe();
    };
  }, []);
};
