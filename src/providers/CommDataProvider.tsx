import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Tables } from "@/database.types";
import { useStdDataList } from "@/api/stdData";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

type Code = Tables<"codes">;

interface CommData {
  getCodeByGroupAndCode: (
    group_cd: string,
    code_cd: string
  ) => string | undefined;
  getCodeByGroup: (group_cd: string) => Code[];
}

const CommDataContext = createContext<CommData>({
  getCodeByGroupAndCode: () => undefined,
  getCodeByGroup: () => [],
});

const CommDataProvider = ({ children }: PropsWithChildren) => {
  const defaultData = [
    {
      code_cd: "EVEN_BAY_END_TIME",
      code_val: "23:00",
      create_id: null,
      created_at: "2024-06-06T11:44:30.602635",
      description: "짝수BAY종료시분",
      group_cd: "STD_TIME",
      group_nm: "기준시간",
      update_id: null,
      updated_at: "2024-06-06T11:44:30.602635",
    },
    {
      code_cd: "ODD_BAY_END_TIME",
      code_val: "23:00",
      create_id: null,
      created_at: "2024-06-06T11:45:21.032983",
      description: "홀수BAY시작시분",
      group_cd: "STD_TIME",
      group_nm: "기준시간",
      update_id: null,
      updated_at: "2024-06-06T11:45:21.032983",
    },
    {
      code_cd: "SCREEN_INTERVAL_TIME",
      code_val: "50",
      create_id: null,
      created_at: "2024-06-06T11:19:28.365466",
      description: "스크린기준분",
      group_cd: "STD_TIME",
      group_nm: "기준시간",
      update_id: null,
      updated_at: "2024-06-06T11:19:28.365466",
    },
    {
      code_cd: "ODD_BAY_START_TIME",
      code_val: "06:00",
      create_id: null,
      created_at: "2024-06-06T11:45:52.874728",
      description: "홀수BAY시작시분",
      group_cd: "STD_TIME",
      group_nm: "기준시간",
      update_id: null,
      updated_at: "2024-06-06T11:45:52.874728",
    },
    {
      code_cd: "LESSON_START_TIME",
      code_val: "09:00",
      create_id: null,
      created_at: "2024-06-06T10:51:19.899023",
      description: "레슨시작시분",
      group_cd: "STD_TIME",
      group_nm: "기준시간",
      update_id: null,
      updated_at: "2024-06-06T10:51:19.899023",
    },
    {
      code_cd: "LESSON_END_TIME",
      code_val: "21:00",
      create_id: null,
      created_at: "2024-06-06T10:51:40.556914",
      description: "레슨종료시분",
      group_cd: "STD_TIME",
      group_nm: "기준시간",
      update_id: null,
      updated_at: "2024-06-06T10:51:40.556914",
    },
    {
      code_cd: "LESSON_INTERVAL_TIME",
      code_val: "60",
      create_id: null,
      created_at: "2024-06-06T10:52:04.013706",
      description: "레슨기준분",
      group_cd: "STD_TIME",
      group_nm: "기준시간",
      update_id: null,
      updated_at: "2024-06-06T10:52:04.013706",
    },
    {
      code_cd: "EVEN_BAY_STRT_TIME",
      code_val: "06:30",
      create_id: null,
      created_at: "2024-06-06T11:44:04.229807",
      description: "짝수BAY시작시분",
      group_cd: "STD_TIME",
      group_nm: "기준시간",
      update_id: null,
      updated_at: "2024-06-06T11:44:04.229807",
    },
    {
      code_cd: "SCREEN_START_TIME",
      code_val: "09:00",
      create_id: null,
      created_at: "2024-06-11T23:55:41.527374",
      description: "스크린시작시분",
      group_cd: "STD_TIME",
      group_nm: "기준시간",
      update_id: null,
      updated_at: "2024-06-11T23:55:41.527374",
    },
    {
      code_cd: "SCREEN_END_TIME",
      code_val: "21:00",
      create_id: null,
      created_at: "2024-06-11T23:56:05.527232",
      description: "스크린끝시분",
      group_cd: "STD_TIME",
      group_nm: "기준시간",
      update_id: null,
      updated_at: "2024-06-11T23:56:05.527232",
    },
  ];

  const [codes, setCodes] = useState<Code[]>(defaultData);
  const queryClient = useQueryClient();
  const { data: commData, error, isLoading } = useStdDataList();

  useEffect(() => {
    if (commData && commData !== undefined) {
      setCodes(commData);
    }
  }, [commData]);

  useEffect(() => {
    const commDataSubscription = supabase
      .channel("custom-update-channel")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "codes" },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["codes"] });
        }
      )
      .subscribe();

    return () => {
      commDataSubscription.unsubscribe();
    };
  }, []);

  const getCodeByGroupAndCode = (group_cd: string, code_cd: string) => {
    const code = codes.find(
      (code) => code.group_cd === group_cd && code.code_cd === code_cd
    );
    return code ? code.code_val : undefined;
  };

  const getCodeByGroup = (group_cd: string) => {
    return codes.filter((code) => code.group_cd === group_cd);
  };

  return (
    <CommDataContext.Provider value={{ getCodeByGroupAndCode, getCodeByGroup }}>
      {children}
    </CommDataContext.Provider>
  );
};

export default CommDataProvider;
export const useCommDataContext = () => useContext(CommDataContext);
