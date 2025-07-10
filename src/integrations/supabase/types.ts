export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          sender_image: string | null
          sender_name: string
          sender_phone: string | null
          timestamp: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sender_image?: string | null
          sender_name: string
          sender_phone?: string | null
          timestamp?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sender_image?: string | null
          sender_name?: string
          sender_phone?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      homework_status: {
        Row: {
          assignment_id: string
          assignment_name: string
          created_at: string
          due_date: string
          id: string
          student_id: string
          subject: string
          submitted: boolean
          submitted_at: string | null
        }
        Insert: {
          assignment_id: string
          assignment_name: string
          created_at?: string
          due_date: string
          id?: string
          student_id: string
          subject: string
          submitted?: boolean
          submitted_at?: string | null
        }
        Update: {
          assignment_id?: string
          assignment_name?: string
          created_at?: string
          due_date?: string
          id?: string
          student_id?: string
          subject?: string
          submitted?: boolean
          submitted_at?: string | null
        }
        Relationships: []
      }
      leave_applications: {
        Row: {
          created_at: string
          id: string
          number_of_days: number
          reason: string
          return_date: string
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string
          status: string
          student_class: string
          student_division: string
          student_dob: string
          student_image: string | null
          student_name: string
          student_phone: string
          submitted_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          number_of_days: number
          reason: string
          return_date: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date: string
          status?: string
          student_class: string
          student_division: string
          student_dob: string
          student_image?: string | null
          student_name: string
          student_phone: string
          submitted_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          number_of_days?: number
          reason?: string
          return_date?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string
          status?: string
          student_class?: string
          student_division?: string
          student_dob?: string
          student_image?: string | null
          student_name?: string
          student_phone?: string
          submitted_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          audio_url: string | null
          id: string
          sender_phone: string
          text: string | null
          timestamp: string
        }
        Insert: {
          audio_url?: string | null
          id?: string
          sender_phone: string
          text?: string | null
          timestamp?: string
        }
        Update: {
          audio_url?: string | null
          id?: string
          sender_phone?: string
          text?: string | null
          timestamp?: string
        }
        Relationships: []
      }
      messages_chat: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message_text: string
          receiver_id: string
          sender_id: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message_text: string
          receiver_id: string
          sender_id: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message_text?: string
          receiver_id?: string
          sender_id?: string
          timestamp?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          recipient_id: string | null
          role: string
          sender_id: string | null
          timestamp: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          recipient_id?: string | null
          role?: string
          sender_id?: string | null
          timestamp?: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          recipient_id?: string | null
          role?: string
          sender_id?: string | null
          timestamp?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          class: string
          created_at: string
          division: string
          dob: string
          id: string
          image: string | null
          name: string
          phone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          class: string
          created_at?: string
          division: string
          dob: string
          id?: string
          image?: string | null
          name: string
          phone: string
          updated_at?: string
          user_id: string
        }
        Update: {
          class?: string
          created_at?: string
          division?: string
          dob?: string
          id?: string
          image?: string | null
          name?: string
          phone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      public_profiles: {
        Row: {
          class: string
          created_at: string
          division: string
          dob: string
          id: string
          image: string | null
          name: string
          phone: string
          updated_at: string
        }
        Insert: {
          class: string
          created_at?: string
          division: string
          dob: string
          id?: string
          image?: string | null
          name: string
          phone: string
          updated_at?: string
        }
        Update: {
          class?: string
          created_at?: string
          division?: string
          dob?: string
          id?: string
          image?: string | null
          name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      teacher_student_assignments: {
        Row: {
          created_at: string
          id: string
          student_id: string
          subject: string
          teacher_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          student_id: string
          subject: string
          teacher_id: string
        }
        Update: {
          created_at?: string
          id?: string
          student_id?: string
          subject?: string
          teacher_id?: string
        }
        Relationships: []
      }
      test_scores: {
        Row: {
          created_at: string
          date: string
          id: string
          score: number
          student_id: string
          subject: string
          test_name: string
          total: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          score: number
          student_id: string
          subject: string
          test_name: string
          total: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          score?: number
          student_id?: string
          subject?: string
          test_name?: string
          total?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
