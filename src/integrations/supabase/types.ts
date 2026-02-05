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
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          organization: string
          request_pilot: boolean | null
          request_security_brief: boolean | null
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          organization: string
          request_pilot?: boolean | null
          request_security_brief?: boolean | null
          role: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          organization?: string
          request_pilot?: boolean | null
          request_security_brief?: boolean | null
          role?: string
        }
        Relationships: []
      }
      demo_fraud_edges: {
        Row: {
          created_at: string
          edge_type: string
          id: string
          source_node_id: string
          target_node_id: string
        }
        Insert: {
          created_at?: string
          edge_type: string
          id?: string
          source_node_id: string
          target_node_id: string
        }
        Update: {
          created_at?: string
          edge_type?: string
          id?: string
          source_node_id?: string
          target_node_id?: string
        }
        Relationships: []
      }
      demo_fraud_nodes: {
        Row: {
          case_id: string | null
          created_at: string
          flagged: boolean | null
          id: string
          label: string
          metadata: Json | null
          node_id: string
          node_type: string
          risk_score: number | null
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          flagged?: boolean | null
          id?: string
          label: string
          metadata?: Json | null
          node_id: string
          node_type: string
          risk_score?: number | null
        }
        Update: {
          case_id?: string | null
          created_at?: string
          flagged?: boolean | null
          id?: string
          label?: string
          metadata?: Json | null
          node_id?: string
          node_type?: string
          risk_score?: number | null
        }
        Relationships: []
      }
      entity_documents: {
        Row: {
          document_id: string
          entity_id: string
          id: string
          linked_at: string
        }
        Insert: {
          document_id: string
          entity_id: string
          id?: string
          linked_at?: string
        }
        Update: {
          document_id?: string
          entity_id?: string
          id?: string
          linked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_documents_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "vault_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          created_at: string
          email: string
          id: string
          linkedin_url: string | null
          message: string | null
          name: string
          position_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          linkedin_url?: string | null
          message?: string | null
          name: string
          position_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          linkedin_url?: string | null
          message?: string | null
          name?: string
          position_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "open_positions"
            referencedColumns: ["id"]
          },
        ]
      }
      open_positions: {
        Row: {
          created_at: string
          department: string | null
          id: string
          is_active: boolean | null
          location: string
          title: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          id?: string
          is_active?: boolean | null
          location: string
          title: string
        }
        Update: {
          created_at?: string
          department?: string | null
          id?: string
          is_active?: boolean | null
          location?: string
          title?: string
        }
        Relationships: []
      }
      platform_alerts: {
        Row: {
          alert_type: string
          case_id: string | null
          created_at: string
          entity_id: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          severity: string
          title: string
        }
        Insert: {
          alert_type: string
          case_id?: string | null
          created_at?: string
          entity_id?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          severity?: string
          title: string
        }
        Update: {
          alert_type?: string
          case_id?: string | null
          created_at?: string
          entity_id?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          severity?: string
          title?: string
        }
        Relationships: []
      }
      platform_audit_log: {
        Row: {
          action: string
          context: Json | null
          created_at: string
          id: string
          source: string
          target_id: string | null
          target_type: string | null
          user_role: string | null
        }
        Insert: {
          action: string
          context?: Json | null
          created_at?: string
          id?: string
          source?: string
          target_id?: string | null
          target_type?: string | null
          user_role?: string | null
        }
        Update: {
          action?: string
          context?: Json | null
          created_at?: string
          id?: string
          source?: string
          target_id?: string | null
          target_type?: string | null
          user_role?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vault_documents: {
        Row: {
          case_id: string | null
          created_at: string
          entity_id: string | null
          extracted_text: string | null
          file_path: string
          file_size: number
          filename: string
          flagged: boolean | null
          id: string
          metadata: Json | null
          mime_type: string
          ocr_confidence: number | null
          ocr_status: string | null
          risk_score: number | null
          sha256_hash: string
          updated_at: string
        }
        Insert: {
          case_id?: string | null
          created_at?: string
          entity_id?: string | null
          extracted_text?: string | null
          file_path: string
          file_size: number
          filename: string
          flagged?: boolean | null
          id?: string
          metadata?: Json | null
          mime_type: string
          ocr_confidence?: number | null
          ocr_status?: string | null
          risk_score?: number | null
          sha256_hash: string
          updated_at?: string
        }
        Update: {
          case_id?: string | null
          created_at?: string
          entity_id?: string | null
          extracted_text?: string | null
          file_path?: string
          file_size?: number
          filename?: string
          flagged?: boolean | null
          id?: string
          metadata?: Json | null
          mime_type?: string
          ocr_confidence?: number | null
          ocr_status?: string | null
          risk_score?: number | null
          sha256_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      vizesepetim_applicants: {
        Row: {
          created_at: string
          external_id: string
          gender: string | null
          id: string
          ip_address: string | null
          ip_country: string | null
          ip_is_vpn: boolean | null
          linked_entity_id: string | null
          metadata: Json | null
          mobile_number_hash: string
          processed_at: string | null
          target_country: string
        }
        Insert: {
          created_at?: string
          external_id: string
          gender?: string | null
          id?: string
          ip_address?: string | null
          ip_country?: string | null
          ip_is_vpn?: boolean | null
          linked_entity_id?: string | null
          metadata?: Json | null
          mobile_number_hash: string
          processed_at?: string | null
          target_country: string
        }
        Update: {
          created_at?: string
          external_id?: string
          gender?: string | null
          id?: string
          ip_address?: string | null
          ip_country?: string | null
          ip_is_vpn?: boolean | null
          linked_entity_id?: string | null
          metadata?: Json | null
          mobile_number_hash?: string
          processed_at?: string | null
          target_country?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_elevated_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_platform_action: {
        Args: {
          _action: string
          _context?: Json
          _target_id?: string
          _target_type?: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "supervisor" | "analyst" | "viewer"
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
      app_role: ["admin", "supervisor", "analyst", "viewer"],
    },
  },
} as const
