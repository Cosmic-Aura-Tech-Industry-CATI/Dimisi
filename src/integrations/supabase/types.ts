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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_value: Json | null
          old_value: Json | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_value?: Json | null
          old_value?: Json | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          message: string | null
          page: string | null
          source: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          message?: string | null
          page?: string | null
          source?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          message?: string | null
          page?: string | null
          source?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          designation: string | null
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          notify_email: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          designation?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          notify_email?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          designation?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          notify_email?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      review_campaigns: {
        Row: {
          campaign_name: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          location: string | null
          scans: number
          service_name: string | null
          slug: string
          submissions: number
          updated_at: string
          visits: number
        }
        Insert: {
          campaign_name: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          scans?: number
          service_name?: string | null
          slug: string
          submissions?: number
          updated_at?: string
          visits?: number
        }
        Update: {
          campaign_name?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          scans?: number
          service_name?: string | null
          slug?: string
          submissions?: number
          updated_at?: string
          visits?: number
        }
        Relationships: []
      }
      review_reports: {
        Row: {
          created_at: string
          id: string
          message: string | null
          reason: string
          reporter_email: string | null
          reporter_name: string | null
          resolved_at: string | null
          resolved_by: string | null
          review_id: string
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          reason: string
          reporter_email?: string | null
          reporter_name?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          review_id: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          reason?: string
          reporter_email?: string | null
          reporter_name?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          review_id?: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "review_reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "public_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_reports_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_settings: {
        Row: {
          id: boolean
          notify_campaign_summary: boolean
          notify_email: string | null
          notify_on_approve: boolean
          notify_on_reject: boolean
          notify_on_report: boolean
          notify_on_submit: boolean
          updated_at: string
        }
        Insert: {
          id?: boolean
          notify_campaign_summary?: boolean
          notify_email?: string | null
          notify_on_approve?: boolean
          notify_on_reject?: boolean
          notify_on_report?: boolean
          notify_on_submit?: boolean
          updated_at?: string
        }
        Update: {
          id?: boolean
          notify_campaign_summary?: boolean
          notify_email?: string | null
          notify_on_approve?: boolean
          notify_on_reject?: boolean
          notify_on_report?: boolean
          notify_on_submit?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved_at: string | null
          archived_at: string | null
          campaign_id: string | null
          consent_to_publish: boolean
          customer_email: string | null
          customer_location: string | null
          customer_name: string
          customer_phone: string | null
          customer_photo_url: string | null
          id: string
          is_featured: boolean
          moderated_by: string | null
          moderation_reason: string | null
          rating: number
          rejected_at: string | null
          review_text: string
          service_name: string | null
          status: Database["public"]["Enums"]["review_status"]
          submitted_at: string
          submitter_ip: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          archived_at?: string | null
          campaign_id?: string | null
          consent_to_publish?: boolean
          customer_email?: string | null
          customer_location?: string | null
          customer_name: string
          customer_phone?: string | null
          customer_photo_url?: string | null
          id?: string
          is_featured?: boolean
          moderated_by?: string | null
          moderation_reason?: string | null
          rating: number
          rejected_at?: string | null
          review_text: string
          service_name?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          submitted_at?: string
          submitter_ip?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          archived_at?: string | null
          campaign_id?: string | null
          consent_to_publish?: boolean
          customer_email?: string | null
          customer_location?: string | null
          customer_name?: string
          customer_phone?: string | null
          customer_photo_url?: string | null
          id?: string
          is_featured?: boolean
          moderated_by?: string | null
          moderation_reason?: string | null
          rating?: number
          rejected_at?: string | null
          review_text?: string
          service_name?: string | null
          status?: Database["public"]["Enums"]["review_status"]
          submitted_at?: string
          submitter_ip?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "review_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_reviews: {
        Row: {
          customer_location: string | null
          customer_name: string | null
          customer_photo_url: string | null
          id: string | null
          is_featured: boolean | null
          published_at: string | null
          rating: number | null
          review_text: string | null
          service_name: string | null
          submitted_at: string | null
        }
        Insert: {
          customer_location?: string | null
          customer_name?: string | null
          customer_photo_url?: string | null
          id?: string | null
          is_featured?: boolean | null
          published_at?: never
          rating?: number | null
          review_text?: string | null
          service_name?: string | null
          submitted_at?: string | null
        }
        Update: {
          customer_location?: string | null
          customer_name?: string | null
          customer_photo_url?: string | null
          id?: string | null
          is_featured?: boolean | null
          published_at?: never
          rating?: number | null
          review_text?: string | null
          service_name?: string | null
          submitted_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      bump_campaign_counter: {
        Args: { _kind: string; _slug: string }
        Returns: undefined
      }
      get_public_campaign: {
        Args: { _slug: string }
        Returns: {
          campaign_name: string
          id: string
          location: string
          service_name: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      report_status: "open" | "resolved" | "dismissed"
      review_status: "pending" | "approved" | "rejected" | "archived"
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
      app_role: ["admin", "user"],
      report_status: ["open", "resolved", "dismissed"],
      review_status: ["pending", "approved", "rejected", "archived"],
    },
  },
} as const
