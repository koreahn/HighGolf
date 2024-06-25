import { Functions } from "@/types";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

type UsersWithMbr = Functions<"get_user_and_latest_membership">;
type UserWithMbr = UsersWithMbr[0];

const defaultUser: UserWithMbr = {
  user_id: 0,
  id: "",
  token: "",
  user_type: "",
  user_name: "",
  contact: "",
  user_mbrs_id: 0,
  mbr_type: "",
  mbr_name: "",
  mbr_desc: "",
  nick: "",
  division: "",
  status: "",
  pmt_amt: 0,
  pmt_dt: "",
  pmt_mthd: "",
  pending_amt: 0,
  join_dt: "",
  finish_dt: "",
  stop_cnt: 0,
  stopped_cnt: 0,
  stop_desc: "",
  stop_dt: "",
  start_dt: "",
  description: "",
};

type AuthData = {
  session: Session | null;
  user: UserWithMbr;
  loading: boolean;
  isAdmin: boolean;
  fetchUser: () => void;
};

const AuthContext = createContext<AuthData>({
  session: null,
  user: defaultUser,
  loading: true,
  isAdmin: false,
  fetchUser: () => {},
});

const AuthProvider = ({ children }: PropsWithChildren) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserWithMbr>(defaultUser);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);

      setLoading(false);
    };

    fetchSession();

    supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === "TOKEN_REFRESHED") {
        return;
      }
      setSession(session);
    });
  }, []);

  useEffect(() => {
    fetchUser();
  }, [session]);

  const fetchUser = async () => {
    if (session) {
      const { data, error } = await supabase.rpc(
        "get_user_and_latest_membership",
        { p_id: session.user.id }
      );

      if (error) {
        throw new Error(error.message);
      }
      if (data === null || data[0] === null) {
        throw new Error("사용자 정보가 없습니다.");
      } else {
        setUser(data[0]);
        if (data[0].user_type === "ADMIN") {
          router.push("/(admin)/");
        } else {
          if (!data[0].user_name) {
            Alert.alert(
              "이름을 저장하신 후 정상적으로 서비스를 이용하실 수 있습니다."
            );
            router.push("/account");
          } else {
            router.push("/(user)/");
          }
        }
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        loading,
        user,
        isAdmin: user?.user_type !== "USER",
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
export const useAuthContext = () => useContext(AuthContext);
