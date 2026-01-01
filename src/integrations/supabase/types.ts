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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      automation_settings: {
        Row: {
          base_resume_text: string | null
          base_resume_title: string | null
          created_at: string
          experience_level: string
          id: string
          is_active: boolean
          job_title: string
          jobs_found_today: number
          jobs_found_today_reset_at: string
          keywords_exclude: string[] | null
          keywords_include: string[] | null
          last_searched_at: string | null
          location: string
          search_frequency: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_resume_text?: string | null
          base_resume_title?: string | null
          created_at?: string
          experience_level?: string
          id?: string
          is_active?: boolean
          job_title: string
          jobs_found_today?: number
          jobs_found_today_reset_at?: string
          keywords_exclude?: string[] | null
          keywords_include?: string[] | null
          last_searched_at?: string | null
          location: string
          search_frequency?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_resume_text?: string | null
          base_resume_title?: string | null
          created_at?: string
          experience_level?: string
          id?: string
          is_active?: boolean
          job_title?: string
          jobs_found_today?: number
          jobs_found_today_reset_at?: string
          keywords_exclude?: string[] | null
          keywords_include?: string[] | null
          last_searched_at?: string | null
          location?: string
          search_frequency?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_descriptions: {
        Row: {
          company: string | null
          created_at: string
          id: string
          parsed_data: Json | null
          raw_text: string
          title: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          id?: string
          parsed_data?: Json | null
          raw_text: string
          title?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          id?: string
          parsed_data?: Json | null
          raw_text?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      job_drafts: {
        Row: {
          adzuna_job_id: string | null
          ats_score: number
          automation_id: string | null
          company_name: string | null
          created_at: string
          id: string
          job_description: string
          job_title: string
          job_url: string | null
          location: string | null
          optimized_resume: string | null
          original_resume: string | null
          posted_date: string | null
          score_breakdown: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          adzuna_job_id?: string | null
          ats_score?: number
          automation_id?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          job_description: string
          job_title: string
          job_url?: string | null
          location?: string | null
          optimized_resume?: string | null
          original_resume?: string | null
          posted_date?: string | null
          score_breakdown?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          adzuna_job_id?: string | null
          ats_score?: number
          automation_id?: string | null
          company_name?: string | null
          created_at?: string
          id?: string
          job_description?: string
          job_title?: string
          job_url?: string | null
          location?: string | null
          optimized_resume?: string | null
          original_resume?: string | null
          posted_date?: string | null
          score_breakdown?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_drafts_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automation_settings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          created_at: string
          id: string
          parsed_data: Json | null
          raw_text: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parsed_data?: Json | null
          raw_text?: string | null
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parsed_data?: Json | null
          raw_text?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scans: {
        Row: {
          created_at: string
          feedback: Json | null
          id: string
          job_description_id: string | null
          optimized_resume: Json | null
          overall_score: number
          resume_id: string | null
          score_breakdown: Json | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback?: Json | null
          id?: string
          job_description_id?: string | null
          optimized_resume?: Json | null
          overall_score?: number
          resume_id?: string | null
          score_breakdown?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback?: Json | null
          id?: string
          job_description_id?: string | null
          optimized_resume?: Json | null
          overall_score?: number
          resume_id?: string | null
          score_breakdown?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scans_job_description_id_fkey"
            columns: ["job_description_id"]
            isOneToOne: false
            referencedRelation: "job_descriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scans_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
