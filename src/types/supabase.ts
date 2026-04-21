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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      backfill_progress: {
        Row: {
          api_errors: number | null
          current_salon: string | null
          finished_at: string | null
          id: string
          processed: number | null
          skipped: number | null
          started_at: string | null
          status: string
          total_profiles: number | null
          updated: number | null
          updated_at: string | null
        }
        Insert: {
          api_errors?: number | null
          current_salon?: string | null
          finished_at?: string | null
          id?: string
          processed?: number | null
          skipped?: number | null
          started_at?: string | null
          status?: string
          total_profiles?: number | null
          updated?: number | null
          updated_at?: string | null
        }
        Update: {
          api_errors?: number | null
          current_salon?: string | null
          finished_at?: string | null
          id?: string
          processed?: number | null
          skipped?: number | null
          started_at?: string | null
          status?: string
          total_profiles?: number | null
          updated?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      salon_applications: {
        Row: {
          application_type: string | null
          br_document: string | null
          contact_number: string | null
          contact_person: string | null
          created_by: string | null
          created_by_email: string | null
          created_date: string | null
          district: string | null
          email: string | null
          id: string
          is_test: boolean | null
          namecard_photo: string | null
          rejection_reason: string | null
          salon_name: string | null
          shopify_product_id: string | null
          status: string | null
          storefront_photo: string | null
          updated_at: string | null
          website: string | null
          whatsapp_number: string | null
        }
        Insert: {
          application_type?: string | null
          br_document?: string | null
          contact_number?: string | null
          contact_person?: string | null
          created_by?: string | null
          created_by_email?: string | null
          created_date?: string | null
          district?: string | null
          email?: string | null
          id?: string
          is_test?: boolean | null
          namecard_photo?: string | null
          rejection_reason?: string | null
          salon_name?: string | null
          shopify_product_id?: string | null
          status?: string | null
          storefront_photo?: string | null
          updated_at?: string | null
          website?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          application_type?: string | null
          br_document?: string | null
          contact_number?: string | null
          contact_person?: string | null
          created_by?: string | null
          created_by_email?: string | null
          created_date?: string | null
          district?: string | null
          email?: string | null
          id?: string
          is_test?: boolean | null
          namecard_photo?: string | null
          rejection_reason?: string | null
          salon_name?: string | null
          shopify_product_id?: string | null
          status?: string | null
          storefront_photo?: string | null
          updated_at?: string | null
          website?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salon_applications_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_profile_versions: {
        Row: {
          address: string | null
          contact_number: string | null
          contact_person: string | null
          created_by: string | null
          created_by_email: string | null
          created_date: string | null
          description: string | null
          district: string | null
          email: string | null
          handle: string | null
          highlight_tags: Json | null
          id: string
          is_starred: boolean | null
          namecard_photo: string | null
          office_hr_fri: string | null
          office_hr_mon: string | null
          office_hr_sat: string | null
          office_hr_sun: string | null
          office_hr_thu: string | null
          office_hr_tue: string | null
          office_hr_wed: string | null
          product_media: Json | null
          profile_id: string | null
          rejection_reason: string | null
          salon_name: string | null
          selected_tags: Json | null
          seo_description: string | null
          seo_title: string | null
          shopify_product_id: string | null
          status: string | null
          storefront_photo: string | null
          tags: string | null
          updated_at: string | null
          version_name: string | null
          website: string | null
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          contact_number?: string | null
          contact_person?: string | null
          created_by?: string | null
          created_by_email?: string | null
          created_date?: string | null
          description?: string | null
          district?: string | null
          email?: string | null
          handle?: string | null
          highlight_tags?: Json | null
          id?: string
          is_starred?: boolean | null
          namecard_photo?: string | null
          office_hr_fri?: string | null
          office_hr_mon?: string | null
          office_hr_sat?: string | null
          office_hr_sun?: string | null
          office_hr_thu?: string | null
          office_hr_tue?: string | null
          office_hr_wed?: string | null
          product_media?: Json | null
          profile_id?: string | null
          rejection_reason?: string | null
          salon_name?: string | null
          selected_tags?: Json | null
          seo_description?: string | null
          seo_title?: string | null
          shopify_product_id?: string | null
          status?: string | null
          storefront_photo?: string | null
          tags?: string | null
          updated_at?: string | null
          version_name?: string | null
          website?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          contact_number?: string | null
          contact_person?: string | null
          created_by?: string | null
          created_by_email?: string | null
          created_date?: string | null
          description?: string | null
          district?: string | null
          email?: string | null
          handle?: string | null
          highlight_tags?: Json | null
          id?: string
          is_starred?: boolean | null
          namecard_photo?: string | null
          office_hr_fri?: string | null
          office_hr_mon?: string | null
          office_hr_sat?: string | null
          office_hr_sun?: string | null
          office_hr_thu?: string | null
          office_hr_tue?: string | null
          office_hr_wed?: string | null
          product_media?: Json | null
          profile_id?: string | null
          rejection_reason?: string | null
          salon_name?: string | null
          selected_tags?: Json | null
          seo_description?: string | null
          seo_title?: string | null
          shopify_product_id?: string | null
          status?: string | null
          storefront_photo?: string | null
          tags?: string | null
          updated_at?: string | null
          version_name?: string | null
          website?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salon_profile_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salon_profile_versions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "salon_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_profiles: {
        Row: {
          address: string | null
          application_id: string | null
          contact_number: string | null
          contact_person: string | null
          created_by: string | null
          created_by_email: string | null
          created_date: string | null
          description: string | null
          district: string | null
          district_id: string | null
          district_name: string | null
          email: string | null
          handle: string | null
          highlight_tags: Json | null
          id: string
          image_src: string | null
          is_active: boolean | null
          namecard_photo: string | null
          office_hr_fri: string | null
          office_hr_mon: string | null
          office_hr_sat: string | null
          office_hr_sun: string | null
          office_hr_thu: string | null
          office_hr_tue: string | null
          office_hr_wed: string | null
          product_media: Json | null
          product_type: string | null
          raw_data: Json | null
          salon_name: string | null
          selected_tags: Json | null
          seo_description: string | null
          seo_title: string | null
          shopify_created_at: string | null
          shopify_product_id: string | null
          shopify_sync_pending: boolean | null
          shopify_synced: boolean | null
          storefront_photo: string | null
          synced_at: string | null
          tags: string | null
          updated_at: string | null
          vendor: string | null
          website: string | null
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          application_id?: string | null
          contact_number?: string | null
          contact_person?: string | null
          created_by?: string | null
          created_by_email?: string | null
          created_date?: string | null
          description?: string | null
          district?: string | null
          district_id?: string | null
          district_name?: string | null
          email?: string | null
          handle?: string | null
          highlight_tags?: Json | null
          id?: string
          image_src?: string | null
          is_active?: boolean | null
          namecard_photo?: string | null
          office_hr_fri?: string | null
          office_hr_mon?: string | null
          office_hr_sat?: string | null
          office_hr_sun?: string | null
          office_hr_thu?: string | null
          office_hr_tue?: string | null
          office_hr_wed?: string | null
          product_media?: Json | null
          product_type?: string | null
          raw_data?: Json | null
          salon_name?: string | null
          selected_tags?: Json | null
          seo_description?: string | null
          seo_title?: string | null
          shopify_created_at?: string | null
          shopify_product_id?: string | null
          shopify_sync_pending?: boolean | null
          shopify_synced?: boolean | null
          storefront_photo?: string | null
          synced_at?: string | null
          tags?: string | null
          updated_at?: string | null
          vendor?: string | null
          website?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          application_id?: string | null
          contact_number?: string | null
          contact_person?: string | null
          created_by?: string | null
          created_by_email?: string | null
          created_date?: string | null
          description?: string | null
          district?: string | null
          district_id?: string | null
          district_name?: string | null
          email?: string | null
          handle?: string | null
          highlight_tags?: Json | null
          id?: string
          image_src?: string | null
          is_active?: boolean | null
          namecard_photo?: string | null
          office_hr_fri?: string | null
          office_hr_mon?: string | null
          office_hr_sat?: string | null
          office_hr_sun?: string | null
          office_hr_thu?: string | null
          office_hr_tue?: string | null
          office_hr_wed?: string | null
          product_media?: Json | null
          product_type?: string | null
          raw_data?: Json | null
          salon_name?: string | null
          selected_tags?: Json | null
          seo_description?: string | null
          seo_title?: string | null
          shopify_created_at?: string | null
          shopify_product_id?: string | null
          shopify_sync_pending?: boolean | null
          shopify_synced?: boolean | null
          storefront_photo?: string | null
          synced_at?: string | null
          tags?: string | null
          updated_at?: string | null
          vendor?: string | null
          website?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "salon_profiles_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "salon_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "salon_profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      salon_tags: {
        Row: {
          category: string
          created_at: string | null
          id: string
          label: string
          prefix: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          label: string
          prefix: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          label?: string
          prefix?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shopify_configs: {
        Row: {
          access_token: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          key: string
          last_refreshed: string | null
          refreshed_at: string | null
          scope: string | null
          shop_domain: string | null
          token_type: string | null
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key: string
          last_refreshed?: string | null
          refreshed_at?: string | null
          scope?: string | null
          shop_domain?: string | null
          token_type?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          key?: string
          last_refreshed?: string | null
          refreshed_at?: string | null
          scope?: string | null
          shop_domain?: string | null
          token_type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shopify_products_cache: {
        Row: {
          district_id: string | null
          district_name: string | null
          handle: string | null
          id: string
          image_src: string | null
          product_type: string | null
          raw_data: Json | null
          shopify_created_at: string | null
          status: string | null
          synced_at: string | null
          tags: string | null
          title: string | null
          updated_at: string | null
          vendor: string | null
        }
        Insert: {
          district_id?: string | null
          district_name?: string | null
          handle?: string | null
          id: string
          image_src?: string | null
          product_type?: string | null
          raw_data?: Json | null
          shopify_created_at?: string | null
          status?: string | null
          synced_at?: string | null
          tags?: string | null
          title?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Update: {
          district_id?: string | null
          district_name?: string | null
          handle?: string | null
          id?: string
          image_src?: string | null
          product_type?: string | null
          raw_data?: Json | null
          shopify_created_at?: string | null
          status?: string | null
          synced_at?: string | null
          tags?: string | null
          title?: string | null
          updated_at?: string | null
          vendor?: string | null
        }
        Relationships: []
      }
      shopify_sync_log: {
        Row: {
          error: string | null
          id: string
          product_count: number | null
          status: string | null
          synced_at: string | null
        }
        Insert: {
          error?: string | null
          id?: string
          product_count?: number | null
          status?: string | null
          synced_at?: string | null
        }
        Update: {
          error?: string | null
          id?: string
          product_count?: number | null
          status?: string | null
          synced_at?: string | null
        }
        Relationships: []
      }
      shopify_token_logs: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          status: string
          triggered_by: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          status: string
          triggered_by?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          status?: string
          triggered_by?: string | null
        }
        Relationships: []
      }
      user_activity_logs: {
        Row: {
          action: string | null
          created_date: string | null
          details: string | null
          error_message: string | null
          id: string
          is_error: boolean | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action?: string | null
          created_date?: string | null
          details?: string | null
          error_message?: string | null
          id?: string
          is_error?: boolean | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string | null
          created_date?: string | null
          details?: string | null
          error_message?: string | null
          id?: string
          is_error?: boolean | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          role: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      whatsapp_settings: {
        Row: {
          created_at: string | null
          id: string
          phone_number: string
          preset_message: string
          updated_at: string | null
          user_preset_message: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          phone_number?: string
          preset_message?: string
          updated_at?: string | null
          user_preset_message?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          phone_number?: string
          preset_message?: string
          updated_at?: string | null
          user_preset_message?: string | null
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
