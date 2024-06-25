export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      approvals: {
        Row: {
          appr_dt: string
          appr_id: number
          appr_stts: string
          appr_type: string
          branch_id: number
          comments: string | null
          create_id: string | null
          created_at: string | null
          start_dt: string | null
          std_dt: string | null
          std_end_tm: string | null
          std_start_tm: string | null
          stop_dt: string | null
          type_id: number
          update_id: string | null
          updated_at: string | null
          user_id: number
          user_name: string
        }
        Insert: {
          appr_dt: string
          appr_id?: number
          appr_stts: string
          appr_type: string
          branch_id: number
          comments?: string | null
          create_id?: string | null
          created_at?: string | null
          start_dt?: string | null
          std_dt?: string | null
          std_end_tm?: string | null
          std_start_tm?: string | null
          stop_dt?: string | null
          type_id: number
          update_id?: string | null
          updated_at?: string | null
          user_id: number
          user_name: string
        }
        Update: {
          appr_dt?: string
          appr_id?: number
          appr_stts?: string
          appr_type?: string
          branch_id?: number
          comments?: string | null
          create_id?: string | null
          created_at?: string | null
          start_dt?: string | null
          std_dt?: string | null
          std_end_tm?: string | null
          std_start_tm?: string | null
          stop_dt?: string | null
          type_id?: number
          update_id?: string | null
          updated_at?: string | null
          user_id?: number
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "approvals_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "approvals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      baskets: {
        Row: {
          basket_id: number
          branch_id: number
          create_id: string | null
          created_at: string | null
          eng_nm: string
          kor_nm: string
          menu_id: number
          order_id: number
          price: number
          quantity: number
          update_id: string | null
          updated_at: string | null
        }
        Insert: {
          basket_id?: number
          branch_id: number
          create_id?: string | null
          created_at?: string | null
          eng_nm: string
          kor_nm: string
          menu_id: number
          order_id: number
          price: number
          quantity: number
          update_id?: string | null
          updated_at?: string | null
        }
        Update: {
          basket_id?: number
          branch_id?: number
          create_id?: string | null
          created_at?: string | null
          eng_nm?: string
          kor_nm?: string
          menu_id?: number
          order_id?: number
          price?: number
          quantity?: number
          update_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "baskets_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "baskets_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["menu_id"]
          },
          {
            foreignKeyName: "baskets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["order_id"]
          },
        ]
      }
      booking_status: {
        Row: {
          booking_dt: string
          booking_id: number
          booking_type: string
          branch_id: number
          create_id: string | null
          created_at: string | null
          description: string | null
          display_name: string
          end_tm: string
          facility_id: number
          member: string | null
          player_cnt: number | null
          start_tm: string
          status: string
          update_id: string | null
          updated_at: string | null
          user_id: number
          user_name: string
        }
        Insert: {
          booking_dt: string
          booking_id?: number
          booking_type: string
          branch_id: number
          create_id?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          end_tm: string
          facility_id: number
          member?: string | null
          player_cnt?: number | null
          start_tm: string
          status: string
          update_id?: string | null
          updated_at?: string | null
          user_id: number
          user_name: string
        }
        Update: {
          booking_dt?: string
          booking_id?: number
          booking_type?: string
          branch_id?: number
          create_id?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          end_tm?: string
          facility_id?: number
          member?: string | null
          player_cnt?: number | null
          start_tm?: string
          status?: string
          update_id?: string | null
          updated_at?: string | null
          user_id?: number
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_status_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "booking_status_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["facility_id"]
          },
          {
            foreignKeyName: "booking_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["user_id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string
          branch_id: number
          branch_name: string
          contact: string
          create_id: string | null
          created_at: string | null
          owner: string
          update_id: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          branch_id?: number
          branch_name: string
          contact: string
          create_id?: string | null
          created_at?: string | null
          owner: string
          update_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          branch_id?: number
          branch_name?: string
          contact?: string
          create_id?: string | null
          created_at?: string | null
          owner?: string
          update_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      codes: {
        Row: {
          code_cd: string
          code_val: string
          create_id: string | null
          created_at: string | null
          description: string | null
          group_cd: string
          group_nm: string
          update_id: string | null
          updated_at: string | null
        }
        Insert: {
          code_cd: string
          code_val: string
          create_id?: string | null
          created_at?: string | null
          description?: string | null
          group_cd: string
          group_nm: string
          update_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code_cd?: string
          code_val?: string
          create_id?: string | null
          created_at?: string | null
          description?: string | null
          group_cd?: string
          group_nm?: string
          update_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      facilities: {
        Row: {
          branch_id: number
          create_id: string | null
          created_at: string | null
          description: string | null
          display_name: string
          end_tm: string
          facility_id: number
          facility_type: string
          is_available: boolean
          order: number | null
          start_tm: string
          update_id: string | null
          updated_at: string | null
        }
        Insert: {
          branch_id: number
          create_id?: string | null
          created_at?: string | null
          description?: string | null
          display_name: string
          end_tm: string
          facility_id?: number
          facility_type: string
          is_available: boolean
          order?: number | null
          start_tm: string
          update_id?: string | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: number
          create_id?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          end_tm?: string
          facility_id?: number
          facility_type?: string
          is_available?: boolean
          order?: number | null
          start_tm?: string
          update_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facilities_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["branch_id"]
          },
        ]
      }
      memberships: {
        Row: {
          branch_id: number
          create_id: string | null
          created_at: string | null
          description: string | null
          division: string
          lesson_cnt: number | null
          lesson_min: number | null
          mbr_id: number
          mbr_name: string
          mbr_type: string
          nick: string
          price: number
          stop_cnt: number | null
          update_id: string | null
          updated_at: string | null
        }
        Insert: {
          branch_id: number
          create_id?: string | null
          created_at?: string | null
          description?: string | null
          division: string
          lesson_cnt?: number | null
          lesson_min?: number | null
          mbr_id?: number
          mbr_name: string
          mbr_type: string
          nick: string
          price: number
          stop_cnt?: number | null
          update_id?: string | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: number
          create_id?: string | null
          created_at?: string | null
          description?: string | null
          division?: string
          lesson_cnt?: number | null
          lesson_min?: number | null
          mbr_id?: number
          mbr_name?: string
          mbr_type?: string
          nick?: string
          price?: number
          stop_cnt?: number | null
          update_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memberships_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["branch_id"]
          },
        ]
      }
      menus: {
        Row: {
          branch_id: number
          create_id: string | null
          created_at: string | null
          description: string | null
          eng_nm: string
          is_stock: boolean
          kor_nm: string
          menu_id: number
          price: number
          update_id: string | null
          updated_at: string | null
        }
        Insert: {
          branch_id: number
          create_id?: string | null
          created_at?: string | null
          description?: string | null
          eng_nm: string
          is_stock: boolean
          kor_nm: string
          menu_id?: number
          price: number
          update_id?: string | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: number
          create_id?: string | null
          created_at?: string | null
          description?: string | null
          eng_nm?: string
          is_stock?: boolean
          kor_nm?: string
          menu_id?: number
          price?: number
          update_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menus_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["branch_id"]
          },
        ]
      }
      orders: {
        Row: {
          branch_id: number
          create_id: string | null
          created_at: string | null
          description: string | null
          display_name: string | null
          facility_id: number | null
          order_id: number
          pmt_mthd: string
          status: string
          total_price: number
          update_id: string | null
          updated_at: string | null
          user_id: number
          user_name: string
        }
        Insert: {
          branch_id: number
          create_id?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          facility_id?: number | null
          order_id?: number
          pmt_mthd: string
          status: string
          total_price: number
          update_id?: string | null
          updated_at?: string | null
          user_id: number
          user_name: string
        }
        Update: {
          branch_id?: number
          create_id?: string | null
          created_at?: string | null
          description?: string | null
          display_name?: string | null
          facility_id?: number | null
          order_id?: number
          pmt_mthd?: string
          status?: string
          total_price?: number
          update_id?: string | null
          updated_at?: string | null
          user_id?: number
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["branch_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      temp: {
        Row: {
          contact: string
          description: string | null
          finish_date: string | null
          join_date: string | null
          mbr_type: string | null
          membership: string | null
          nick: string | null
          payment: number | null
          payment_date: string | null
          pending: number | null
          pmt_mthd: string | null
          start_date: string | null
          stop_date: string | null
          stopped_cnt: number | null
          user_name: string | null
        }
        Insert: {
          contact: string
          description?: string | null
          finish_date?: string | null
          join_date?: string | null
          mbr_type?: string | null
          membership?: string | null
          nick?: string | null
          payment?: number | null
          payment_date?: string | null
          pending?: number | null
          pmt_mthd?: string | null
          start_date?: string | null
          stop_date?: string | null
          stopped_cnt?: number | null
          user_name?: string | null
        }
        Update: {
          contact?: string
          description?: string | null
          finish_date?: string | null
          join_date?: string | null
          mbr_type?: string | null
          membership?: string | null
          nick?: string | null
          payment?: number | null
          payment_date?: string | null
          pending?: number | null
          pmt_mthd?: string | null
          start_date?: string | null
          stop_date?: string | null
          stopped_cnt?: number | null
          user_name?: string | null
        }
        Relationships: []
      }
      user_mbrs: {
        Row: {
          branch_id: number
          create_id: string | null
          created_at: string | null
          division: string
          finish_dt: string | null
          join_dt: string | null
          mbr_id: number
          mbr_name: string
          mbr_type: string
          nick: string
          pending_amt: number | null
          pmt_amt: number | null
          pmt_dt: string | null
          pmt_mthd: string | null
          start_dt: string | null
          status: string
          stop_cnt: number | null
          stop_desc: string | null
          stop_dt: string | null
          stopped_cnt: number | null
          update_id: string | null
          updated_at: string | null
          user_id: number
          user_mbrs_id: number
        }
        Insert: {
          branch_id: number
          create_id?: string | null
          created_at?: string | null
          division: string
          finish_dt?: string | null
          join_dt?: string | null
          mbr_id: number
          mbr_name: string
          mbr_type: string
          nick: string
          pending_amt?: number | null
          pmt_amt?: number | null
          pmt_dt?: string | null
          pmt_mthd?: string | null
          start_dt?: string | null
          status: string
          stop_cnt?: number | null
          stop_desc?: string | null
          stop_dt?: string | null
          stopped_cnt?: number | null
          update_id?: string | null
          updated_at?: string | null
          user_id: number
          user_mbrs_id?: number
        }
        Update: {
          branch_id?: number
          create_id?: string | null
          created_at?: string | null
          division?: string
          finish_dt?: string | null
          join_dt?: string | null
          mbr_id?: number
          mbr_name?: string
          mbr_type?: string
          nick?: string
          pending_amt?: number | null
          pmt_amt?: number | null
          pmt_dt?: string | null
          pmt_mthd?: string | null
          start_dt?: string | null
          status?: string
          stop_cnt?: number | null
          stop_desc?: string | null
          stop_dt?: string | null
          stopped_cnt?: number | null
          update_id?: string | null
          updated_at?: string | null
          user_id?: number
          user_mbrs_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_mbrs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "user_mbrs_mbr_id_fkey"
            columns: ["mbr_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["mbr_id"]
          },
        ]
      }
      users: {
        Row: {
          branch_id: number
          branch_name: string
          contact: string
          create_id: string | null
          created_at: string | null
          description: string | null
          id: string
          token: string | null
          update_id: string | null
          updated_at: string | null
          user_id: number
          user_name: string | null
          user_type: string
        }
        Insert: {
          branch_id: number
          branch_name: string
          contact: string
          create_id?: string | null
          created_at?: string | null
          description?: string | null
          id: string
          token?: string | null
          update_id?: string | null
          updated_at?: string | null
          user_id?: number
          user_name?: string | null
          user_type: string
        }
        Update: {
          branch_id?: number
          branch_name?: string
          contact?: string
          create_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          token?: string | null
          update_id?: string | null
          updated_at?: string | null
          user_id?: number
          user_name?: string | null
          user_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["branch_id"]
          },
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_booking_status_cnt: {
        Args: Record<PropertyKey, never>
        Returns: {
          practice_cnt: number
          screen_cnt: number
          lesson_cnt: number
        }[]
      }
      get_order_status_cnt: {
        Args: Record<PropertyKey, never>
        Returns: {
          ordered: number
          preparing: number
          notpaid: number
          completed: number
          canceled: number
        }[]
      }
      get_order_status_cnt_user: {
        Args: {
          p_user_id: number
        }
        Returns: {
          ordered: number
          preparing: number
          notpaid: number
          completed: number
          canceled: number
        }[]
      }
      get_user_and_latest_membership: {
        Args: {
          p_id: string
        }
        Returns: {
          user_id: number
          id: string
          token: string
          user_type: string
          user_name: string
          contact: string
          user_mbrs_id: number
          mbr_type: string
          mbr_name: string
          nick: string
          division: string
          status: string
          pmt_amt: number
          pending_amt: number
          pmt_dt: string
          pmt_mthd: string
          join_dt: string
          finish_dt: string
          stop_cnt: number
          stopped_cnt: number
          stop_desc: string
          stop_dt: string
          start_dt: string
          description: string
          mbr_desc: string
        }[]
      }
      get_user_booking_status_cnt: {
        Args: {
          p_user_id: number
        }
        Returns: {
          practice_cnt: number
          screen_cnt: number
          lesson_cnt: number
        }[]
      }
      get_users_and_latest_membership: {
        Args: Record<PropertyKey, never>
        Returns: {
          user_id: number
          id: string
          token: string
          user_type: string
          user_name: string
          contact: string
          user_mbrs_id: number
          mbr_type: string
          mbr_name: string
          nick: string
          division: string
          status: string
          pmt_amt: number
          pending_amt: number
          pmt_dt: string
          pmt_mthd: string
          join_dt: string
          finish_dt: string
          stop_cnt: number
          stopped_cnt: number
          stop_desc: string
          stop_dt: string
          start_dt: string
          description: string
          mbr_id: number
        }[]
      }
      get_users_mbrs_cnt: {
        Args: Record<PropertyKey, never>
        Returns: {
          all_cnt: number
          practice_cnt: number
          lesson_cnt: number
          guest_cnt: number
          stop_cnt: number
          finish_cnt: number
        }[]
      }
      update_approvals: {
        Args: {
          p_status: string
          p_type: string
          p_type_id: number
          p_user_id: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
