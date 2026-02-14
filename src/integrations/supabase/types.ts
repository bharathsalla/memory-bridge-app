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
      activities: {
        Row: {
          completed: boolean | null
          created_at: string | null
          description: string
          icon: string | null
          id: string
          time: string
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          description: string
          icon?: string | null
          id?: string
          time: string
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          description?: string
          icon?: string | null
          id?: string
          time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cognitive_insights: {
        Row: {
          alerts: Json | null
          analysis_date: string
          avg_engagement: number | null
          created_at: string
          daily_breakdown: Json | null
          id: string
          mood_distribution: Json | null
          recall_rate: number | null
          recalled_count: number | null
          recommendations: Json | null
          total_entries: number | null
        }
        Insert: {
          alerts?: Json | null
          analysis_date?: string
          avg_engagement?: number | null
          created_at?: string
          daily_breakdown?: Json | null
          id?: string
          mood_distribution?: Json | null
          recall_rate?: number | null
          recalled_count?: number | null
          recommendations?: Json | null
          total_entries?: number | null
        }
        Update: {
          alerts?: Json | null
          analysis_date?: string
          avg_engagement?: number | null
          created_at?: string
          daily_breakdown?: Json | null
          id?: string
          mood_distribution?: Json | null
          recall_rate?: number | null
          recalled_count?: number | null
          recommendations?: Json | null
          total_entries?: number | null
        }
        Relationships: []
      }
      medications: {
        Row: {
          created_at: string | null
          dosage: string
          id: string
          instructions: string | null
          name: string
          taken: boolean | null
          taken_at: string | null
          time: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dosage: string
          id?: string
          instructions?: string | null
          name: string
          taken?: boolean | null
          taken_at?: string | null
          time: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dosage?: string
          id?: string
          instructions?: string | null
          name?: string
          taken?: boolean | null
          taken_at?: string | null
          time?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      memories: {
        Row: {
          cognitive_answer: string | null
          cognitive_prompt: string | null
          created_at: string
          description: string | null
          emoji: string | null
          engagement_score: number | null
          id: string
          is_favorite: boolean | null
          mood: string | null
          title: string
          type: string
          updated_at: string
          voice_transcript: string | null
        }
        Insert: {
          cognitive_answer?: string | null
          cognitive_prompt?: string | null
          created_at?: string
          description?: string | null
          emoji?: string | null
          engagement_score?: number | null
          id?: string
          is_favorite?: boolean | null
          mood?: string | null
          title: string
          type?: string
          updated_at?: string
          voice_transcript?: string | null
        }
        Update: {
          cognitive_answer?: string | null
          cognitive_prompt?: string | null
          created_at?: string
          description?: string | null
          emoji?: string | null
          engagement_score?: number | null
          id?: string
          is_favorite?: boolean | null
          mood?: string | null
          title?: string
          type?: string
          updated_at?: string
          voice_transcript?: string | null
        }
        Relationships: []
      }
      vitals: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          recorded_at: string | null
          type: string
          unit: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          recorded_at?: string | null
          type: string
          unit?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          recorded_at?: string | null
          type?: string
          unit?: string | null
          value?: string
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
