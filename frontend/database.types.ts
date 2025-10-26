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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      jobs: {
        Row: {
          created_at: string
          error: Json | null
          finished_at: string | null
          id: string
          job_type: string | null
          payload: Json
          result: Json | null
          started_at: string | null
          status: Database["public"]["Enums"]["status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          error?: Json | null
          finished_at?: string | null
          id: string
          job_type?: string | null
          payload: Json
          result?: Json | null
          started_at?: string | null
          status: Database["public"]["Enums"]["status"]
          user_id: string
        }
        Update: {
          created_at?: string
          error?: Json | null
          finished_at?: string | null
          id?: string
          job_type?: string | null
          payload?: Json
          result?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["status"]
          user_id?: string
        }
        Relationships: []
      }
      "premium-form": {
        Row: {
          created_at: string
          id: number
          response: Json | null
        }
        Insert: {
          created_at?: string
          id?: number
          response?: Json | null
        }
        Update: {
          created_at?: string
          id?: number
          response?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      publishing: {
        Row: {
          channel: string
          created_at: string
          error: Json | null
          id: string
          open_id: string | null
          payload: Json | null
          post_type: Database["public"]["Enums"]["post_type"] | null
          published_at: string | null
          result: Json | null
          scheduled_at: string
          special_reference_id: string | null
          status: Database["public"]["Enums"]["post_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          channel?: string
          created_at?: string
          error?: Json | null
          id?: string
          open_id?: string | null
          payload?: Json | null
          post_type?: Database["public"]["Enums"]["post_type"] | null
          published_at?: string | null
          result?: Json | null
          scheduled_at: string
          special_reference_id?: string | null
          status?: Database["public"]["Enums"]["post_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          channel?: string
          created_at?: string
          error?: Json | null
          id?: string
          open_id?: string | null
          payload?: Json | null
          post_type?: Database["public"]["Enums"]["post_type"] | null
          published_at?: string | null
          result?: Json | null
          scheduled_at?: string
          special_reference_id?: string | null
          status?: Database["public"]["Enums"]["post_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tiktok_accounts: {
        Row: {
          access_token: string
          avatar_url: string | null
          created_at: string
          expires_at: string
          handle: string | null
          id: string
          open_id: string
          refresh_expires_at: string | null
          refresh_token: string
          scope: string
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          avatar_url?: string | null
          created_at?: string
          expires_at: string
          handle?: string | null
          id?: string
          open_id: string
          refresh_expires_at?: string | null
          refresh_token: string
          scope: string
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          avatar_url?: string | null
          created_at?: string
          expires_at?: string
          handle?: string | null
          id?: string
          open_id?: string
          refresh_expires_at?: string | null
          refresh_token?: string
          scope?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tiktok_pkce_states: {
        Row: {
          code_verifier: string
          created_at: string
          expires_at: string
          state: string
          user_id: string
        }
        Insert: {
          code_verifier: string
          created_at?: string
          expires_at?: string
          state: string
          user_id: string
        }
        Update: {
          code_verifier?: string
          created_at?: string
          expires_at?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      tiktok_publish_analytics: {
        Row: {
          average_watch_time: number | null
          average_watch_time_seconds: number | null
          collected_at: string
          comment_count: number | null
          comments: number | null
          completion_rate: number | null
          completion_rate_canonical: number | null
          created_at: string
          favorite_count: number | null
          favorites: number | null
          id: string
          like_count: number | null
          likes: number | null
          open_id: string | null
          publish_id: string
          reach: number | null
          reach_count: number | null
          share_count: number | null
          shares: number | null
          updated_at: string
          user_id: string
          view_count: number | null
          views: number | null
          watch_time: number | null
          watch_time_seconds: number | null
        }
        Insert: {
          average_watch_time?: number | null
          average_watch_time_seconds?: number | null
          collected_at?: string
          comment_count?: number | null
          comments?: number | null
          completion_rate?: number | null
          completion_rate_canonical?: number | null
          created_at?: string
          favorite_count?: number | null
          favorites?: number | null
          id?: string
          like_count?: number | null
          likes?: number | null
          open_id?: string | null
          publish_id: string
          reach?: number | null
          reach_count?: number | null
          share_count?: number | null
          shares?: number | null
          updated_at?: string
          user_id: string
          view_count?: number | null
          views?: number | null
          watch_time?: number | null
          watch_time_seconds?: number | null
        }
        Update: {
          average_watch_time?: number | null
          average_watch_time_seconds?: number | null
          collected_at?: string
          comment_count?: number | null
          comments?: number | null
          completion_rate?: number | null
          completion_rate_canonical?: number | null
          created_at?: string
          favorite_count?: number | null
          favorites?: number | null
          id?: string
          like_count?: number | null
          likes?: number | null
          open_id?: string | null
          publish_id?: string
          reach?: number | null
          reach_count?: number | null
          share_count?: number | null
          shares?: number | null
          updated_at?: string
          user_id?: string
          view_count?: number | null
          views?: number | null
          watch_time?: number | null
          watch_time_seconds?: number | null
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
      post_status:
        | "draft"
        | "scheduled"
        | "queued"
        | "publishing"
        | "published"
        | "failed"
        | "canceled"
      post_type: "VIDEO" | "CAROUSEL"
      status:
        | "queued"
        | "started"
        | "deferred"
        | "finished"
        | "failed"
        | "stopped"
        | "scheduled"
        | "canceled"
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
      post_status: [
        "draft",
        "scheduled",
        "queued",
        "publishing",
        "published",
        "failed",
        "canceled",
      ],
      post_type: ["VIDEO", "CAROUSEL"],
      status: [
        "queued",
        "started",
        "deferred",
        "finished",
        "failed",
        "stopped",
        "scheduled",
        "canceled",
      ],
    },
  },
} as const
