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
      collections: {
        Row: {
          ai_summary: string | null
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          sort_order: number | null
          summary_generated_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          sort_order?: number | null
          summary_generated_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          sort_order?: number | null
          summary_generated_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      conceptual_lacunae: {
        Row: {
          created_at: string
          id: string
          missing_concept_id: string
          notes_count: number
          priority_score: number
          related_concepts: Json
          suggested_traditions: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          missing_concept_id: string
          notes_count?: number
          priority_score?: number
          related_concepts?: Json
          suggested_traditions?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          missing_concept_id?: string
          notes_count?: number
          priority_score?: number
          related_concepts?: Json
          suggested_traditions?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cross_tradition_bridges: {
        Row: {
          ai_generated: boolean
          bridge_concept: string
          created_at: string
          description: string | null
          id: string
          resonance_score: number
          supporting_note_ids: Json
          tradition_a: string
          tradition_b: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean
          bridge_concept: string
          created_at?: string
          description?: string | null
          id?: string
          resonance_score?: number
          supporting_note_ids?: Json
          tradition_a: string
          tradition_b: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean
          bridge_concept?: string
          created_at?: string
          description?: string | null
          id?: string
          resonance_score?: number
          supporting_note_ids?: Json
          tradition_a?: string
          tradition_b?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      note_concept_links: {
        Row: {
          ai_generated: boolean
          created_at: string
          id: string
          link_strength: number
          link_type: string
          shared_concepts: Json
          source_note_id: string
          target_note_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean
          created_at?: string
          id?: string
          link_strength?: number
          link_type?: string
          shared_concepts?: Json
          source_note_id: string
          target_note_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean
          created_at?: string
          id?: string
          link_strength?: number
          link_type?: string
          shared_concepts?: Json
          source_note_id?: string
          target_note_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_concept_links_source_note_id_fkey"
            columns: ["source_note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_concept_links_target_note_id_fkey"
            columns: ["target_note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
        ]
      }
      note_tags: {
        Row: {
          created_at: string | null
          note_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          note_id: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          note_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_tags_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "note_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          collection_id: string | null
          content: string | null
          created_at: string | null
          custom_metadata: Json | null
          detected_concepts: Json | null
          embedding: string | null
          id: string
          source: string | null
          title: string
          updated_at: string | null
          user_id: string
          void_resonance_score: number | null
        }
        Insert: {
          collection_id?: string | null
          content?: string | null
          created_at?: string | null
          custom_metadata?: Json | null
          detected_concepts?: Json | null
          embedding?: string | null
          id?: string
          source?: string | null
          title: string
          updated_at?: string | null
          user_id: string
          void_resonance_score?: number | null
        }
        Update: {
          collection_id?: string | null
          content?: string | null
          created_at?: string | null
          custom_metadata?: Json | null
          detected_concepts?: Json | null
          embedding?: string | null
          id?: string
          source?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
          void_resonance_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notes_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          category: string | null
          color: string | null
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          category?: string | null
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          anthropic_api_key: string | null
          created_at: string | null
          default_model: string | null
          id: string
          openai_api_key: string | null
          preferred_ai_provider:
            | Database["public"]["Enums"]["ai_provider"]
            | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          anthropic_api_key?: string | null
          created_at?: string | null
          default_model?: string | null
          id?: string
          openai_api_key?: string | null
          preferred_ai_provider?:
            | Database["public"]["Enums"]["ai_provider"]
            | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          anthropic_api_key?: string | null
          created_at?: string | null
          default_model?: string | null
          id?: string
          openai_api_key?: string | null
          preferred_ai_provider?:
            | Database["public"]["Enums"]["ai_provider"]
            | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_notes_by_embedding: {
        Args: {
          filter_user_id: string
          match_count: number
          match_threshold: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          similarity: number
          title: string
        }[]
      }
    }
    Enums: {
      ai_provider: "lovable" | "openai" | "anthropic"
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
      ai_provider: ["lovable", "openai", "anthropic"],
    },
  },
} as const
