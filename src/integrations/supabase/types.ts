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
      learned_patterns: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          day_of_week: number | null
          hour: number | null
          id: string
          last_calculated_at: string | null
          pattern_type: string | null
          recommended_actions: string[] | null
          success_rate: number | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          day_of_week?: number | null
          hour?: number | null
          id?: string
          last_calculated_at?: string | null
          pattern_type?: string | null
          recommended_actions?: string[] | null
          success_rate?: number | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          day_of_week?: number | null
          hour?: number | null
          id?: string
          last_calculated_at?: string | null
          pattern_type?: string | null
          recommended_actions?: string[] | null
          success_rate?: number | null
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
          location: string | null
          mood: string | null
          photo_url: string | null
          shared_at: string | null
          shared_by: string | null
          shared_message: string | null
          title: string
          type: string
          updated_at: string
          viewed_by_patient: boolean | null
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
          location?: string | null
          mood?: string | null
          photo_url?: string | null
          shared_at?: string | null
          shared_by?: string | null
          shared_message?: string | null
          title: string
          type?: string
          updated_at?: string
          viewed_by_patient?: boolean | null
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
          location?: string | null
          mood?: string | null
          photo_url?: string | null
          shared_at?: string | null
          shared_by?: string | null
          shared_message?: string | null
          title?: string
          type?: string
          updated_at?: string
          viewed_by_patient?: boolean | null
          voice_transcript?: string | null
        }
        Relationships: []
      }
      reminder_completions: {
        Row: {
          completed_at: string | null
          id: string
          method: string | null
          reminder_id: string | null
          response_time_seconds: number | null
          triggered_by: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          method?: string | null
          reminder_id?: string | null
          response_time_seconds?: number | null
          triggered_by?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          method?: string | null
          reminder_id?: string | null
          response_time_seconds?: number | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminder_completions_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_logs: {
        Row: {
          event_type: string | null
          id: string
          metadata: Json | null
          reminder_id: string | null
          timestamp: string | null
          triggered_by_name: string | null
        }
        Insert: {
          event_type?: string | null
          id?: string
          metadata?: Json | null
          reminder_id?: string | null
          timestamp?: string | null
          triggered_by_name?: string | null
        }
        Update: {
          event_type?: string | null
          id?: string
          metadata?: Json | null
          reminder_id?: string | null
          timestamp?: string | null
          triggered_by_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminder_logs_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders: {
        Row: {
          active: boolean | null
          created_at: string | null
          created_by: string | null
          id: string
          message: string
          persistent: boolean | null
          photo_url: string | null
          priority: string | null
          schedule: Json
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          message: string
          persistent?: boolean | null
          photo_url?: string | null
          priority?: string | null
          schedule?: Json
          title: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          message?: string
          persistent?: boolean | null
          photo_url?: string | null
          priority?: string | null
          schedule?: Json
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      scheduled_reminders: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          last_sent_at: string | null
          next_due_time: string
          reminder_id: string | null
          send_count: number | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_sent_at?: string | null
          next_due_time: string
          reminder_id?: string | null
          send_count?: number | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          last_sent_at?: string | null
          next_due_time?: string
          reminder_id?: string | null
          send_count?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_reminders_reminder_id_fkey"
            columns: ["reminder_id"]
            isOneToOne: false
            referencedRelation: "reminders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          day_of_week: number | null
          hour_of_day: number | null
          id: string
          metadata: Json | null
          timestamp: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          day_of_week?: number | null
          hour_of_day?: number | null
          id?: string
          metadata?: Json | null
          timestamp?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          day_of_week?: number | null
          hour_of_day?: number | null
          id?: string
          metadata?: Json | null
          timestamp?: string | null
        }
        Relationships: []
      }
      user_caregivers: {
        Row: {
          can_trigger_reminders: boolean | null
          caregiver_name: string
          created_at: string | null
          id: string
          patient_name: string
          relationship: string | null
        }
        Insert: {
          can_trigger_reminders?: boolean | null
          caregiver_name?: string
          created_at?: string | null
          id?: string
          patient_name?: string
          relationship?: string | null
        }
        Update: {
          can_trigger_reminders?: boolean | null
          caregiver_name?: string
          created_at?: string | null
          id?: string
          patient_name?: string
          relationship?: string | null
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
