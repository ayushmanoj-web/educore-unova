export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          chat_room_id: string | null
          created_at: string
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_deleted: boolean
          message: string
          message_type: string | null
          replied_to: string | null
          sender_image: string | null
          sender_name: string
          sender_phone: string | null
          timestamp: string
        }
        Insert: {
          chat_room_id?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean
          message: string
          message_type?: string | null
          replied_to?: string | null
          sender_image?: string | null
          sender_name: string
          sender_phone?: string | null
          timestamp?: string
        }
        Update: {
          chat_room_id?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_deleted?: boolean
          message?: string
          message_type?: string | null
          replied_to?: string | null
          sender_image?: string | null
          sender_name?: string
          sender_phone?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_replied_to_fkey"
            columns: ["replied_to"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          chat_room_id: string
          id: string
          is_admin: boolean
          joined_at: string
          last_seen: string | null
          user_id: string
        }
        Insert: {
          chat_room_id: string
          id?: string
          is_admin?: boolean
          joined_at?: string
          last_seen?: string | null
          user_id: string
        }
        Update: {
          chat_room_id?: string
          id?: string
          is_admin?: boolean
          joined_at?: string
          last_seen?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_group: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_group?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_group?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      club_applications: {
        Row: {
          application_details: string
          club_id: string
          created_at: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          student_class: string
          student_division: string
          student_id: string
          student_name: string
          student_phone: string
          submitted_at: string
        }
        Insert: {
          application_details: string
          club_id: string
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          student_class: string
          student_division: string
          student_id: string
          student_name: string
          student_phone: string
          submitted_at?: string
        }
        Update: {
          application_details?: string
          club_id?: string
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          student_class?: string
          student_division?: string
          student_id?: string
          student_name?: string
          student_phone?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_applications_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      club_chat_messages: {
        Row: {
          club_id: string
          created_at: string
          id: string
          message: string
          sender_id: string
          sender_image: string | null
          sender_name: string
          timestamp: string
        }
        Insert: {
          club_id: string
          created_at?: string
          id?: string
          message: string
          sender_id: string
          sender_image?: string | null
          sender_name: string
          timestamp?: string
        }
        Update: {
          club_id?: string
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
          sender_image?: string | null
          sender_name?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "club_chat_messages_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
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
          sender_class: string | null
          sender_division: string | null
          sender_id: string
          sender_name: string | null
          timestamp: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message_text: string
          receiver_id: string
          sender_class?: string | null
          sender_division?: string | null
          sender_id: string
          sender_name?: string | null
          timestamp?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message_text?: string
          receiver_id?: string
          sender_class?: string | null
          sender_division?: string | null
          sender_id?: string
          sender_name?: string | null
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
      teacher_messages: {
        Row: {
          created_at: string
          id: string
          message_text: string
          student_class: string
          student_division: string
          student_name: string
          student_phone: string
          teacher_name: string
          teacher_phone: string
          timestamp: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_text: string
          student_class: string
          student_division: string
          student_name: string
          student_phone: string
          teacher_name: string
          teacher_phone: string
          timestamp?: string
        }
        Update: {
          created_at?: string
          id?: string
          message_text?: string
          student_class?: string
          student_division?: string
          student_name?: string
          student_phone?: string
          teacher_name?: string
          teacher_phone?: string
          timestamp?: string
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
      teachers: {
        Row: {
          class: string
          created_at: string
          division: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          class: string
          created_at?: string
          division: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          class?: string
          created_at?: string
          division?: string
          id?: string
          name?: string
          updated_at?: string
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
      uploaded_media: {
        Row: {
          created_at: string
          description: string | null
          file_path: string
          file_type: string
          id: string
          title: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path: string
          file_type: string
          id?: string
          title: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string
          file_type?: string
          id?: string
          title?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          is_online: boolean
          last_seen: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          id?: string
          is_online?: boolean
          last_seen?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          is_online?: boolean
          last_seen?: string
          updated_at?: string
          user_id?: string
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
