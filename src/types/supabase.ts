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
      clients: {
        Row: {
          bleedingNeck: string
          contactName: string
          contentPillars: Json
          contractValue: number
          createdAt: string
          email: string
          id: number
          ltv: number
          name: string
          niche: string
          notes: string
          onboardingStatus: string
          phone: string
          relationshipHealth: string
          revenueGate: string
          shadowAvatar: string
          startDate: string
          status: string
          tier: string
          timeline: Json
          updatedAt: string
        }
        Insert: {
          bleedingNeck?: string
          contactName?: string
          contentPillars?: Json
          contractValue?: number
          createdAt?: string
          email?: string
          id?: number
          ltv?: number
          name: string
          niche?: string
          notes?: string
          onboardingStatus?: string
          phone?: string
          relationshipHealth?: string
          revenueGate?: string
          shadowAvatar?: string
          startDate?: string
          status?: string
          tier?: string
          timeline?: Json
          updatedAt?: string
        }
        Update: {
          bleedingNeck?: string
          contactName?: string
          contentPillars?: Json
          contractValue?: number
          createdAt?: string
          email?: string
          id?: number
          ltv?: number
          name?: string
          niche?: string
          notes?: string
          onboardingStatus?: string
          phone?: string
          relationshipHealth?: string
          revenueGate?: string
          shadowAvatar?: string
          startDate?: string
          status?: string
          tier?: string
          timeline?: Json
          updatedAt?: string
        }
        Relationships: []
      }
      onboardings: {
        Row: {
          clientId: number
          id: string
          lastUpdated: string
          progress: number
          status: string
          steps: Json
        }
        Insert: {
          clientId: number
          id: string
          lastUpdated?: string
          progress?: number
          status?: string
          steps?: Json
        }
        Update: {
          clientId?: number
          id?: string
          lastUpdated?: string
          progress?: number
          status?: string
          steps?: Json
        }
        Relationships: [
          {
            foreignKeyName: "onboardings_clientId_fkey"
            columns: ["clientId"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          activityLog: Json
          assetLinks: Json
          assignedTo: string
          captionBody: string
          clientId: number
          contentPillar: string
          createdAt: string
          cta: string
          ctaType: string
          hashtags: string
          hook: string
          id: number
          linkedTaskId: number | null
          performance: Json | null
          platforms: Json
          postType: string
          priority: string
          publishedDate: string | null
          referencePost: string | null
          scheduledDate: string
          scheduledTime: string
          status: string
          templateType: string | null
          triggerUsed: string | null
          updatedAt: string
          visualBrief: string
        }
        Insert: {
          activityLog?: Json
          assetLinks?: Json
          assignedTo?: string
          captionBody?: string
          clientId: number
          contentPillar?: string
          createdAt?: string
          cta?: string
          ctaType?: string
          hashtags?: string
          hook?: string
          id?: number
          linkedTaskId?: number | null
          performance?: Json | null
          platforms?: Json
          postType?: string
          priority?: string
          publishedDate?: string | null
          referencePost?: string | null
          scheduledDate?: string
          scheduledTime?: string
          status?: string
          templateType?: string | null
          triggerUsed?: string | null
          updatedAt?: string
          visualBrief?: string
        }
        Update: {
          activityLog?: Json
          assetLinks?: Json
          assignedTo?: string
          captionBody?: string
          clientId?: number
          contentPillar?: string
          createdAt?: string
          cta?: string
          ctaType?: string
          hashtags?: string
          hook?: string
          id?: number
          linkedTaskId?: number | null
          performance?: Json | null
          platforms?: Json
          postType?: string
          priority?: string
          publishedDate?: string | null
          referencePost?: string | null
          scheduledDate?: string
          scheduledTime?: string
          status?: string
          templateType?: string | null
          triggerUsed?: string | null
          updatedAt?: string
          visualBrief?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_clientId_fkey"
            columns: ["clientId"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      protocols: {
        Row: {
          category: string
          content: string
          copyCount: number
          createdAt: string
          exampleOutput: string | null
          externalReferences: Json
          id: number
          linkedClientId: number | null
          linkedTaskTypes: Json
          pillar: string
          promptTool: string | null
          promptVariables: Json
          relatedProtocolIds: Json
          status: string
          tags: Json
          title: string
          updatedAt: string
          usageNotes: string | null
        }
        Insert: {
          category?: string
          content?: string
          copyCount?: number
          createdAt?: string
          exampleOutput?: string | null
          externalReferences?: Json
          id?: number
          linkedClientId?: number | null
          linkedTaskTypes?: Json
          pillar?: string
          promptTool?: string | null
          promptVariables?: Json
          relatedProtocolIds?: Json
          status?: string
          tags?: Json
          title: string
          updatedAt?: string
          usageNotes?: string | null
        }
        Update: {
          category?: string
          content?: string
          copyCount?: number
          createdAt?: string
          exampleOutput?: string | null
          externalReferences?: Json
          id?: number
          linkedClientId?: number | null
          linkedTaskTypes?: Json
          pillar?: string
          promptTool?: string | null
          promptVariables?: Json
          relatedProtocolIds?: Json
          status?: string
          tags?: Json
          title?: string
          updatedAt?: string
          usageNotes?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          ceoPhraseHash: string | null
          id: string
          initialized: boolean | null
          lastUpdated: string | null
          teamPhraseHash: string | null
        }
        Insert: {
          ceoPhraseHash?: string | null
          id?: string
          initialized?: boolean | null
          lastUpdated?: string | null
          teamPhraseHash?: string | null
        }
        Update: {
          ceoPhraseHash?: string | null
          id?: string
          initialized?: boolean | null
          lastUpdated?: string | null
          teamPhraseHash?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          activityLog: Json
          assetLinks: Json
          assignedNode: string
          brief: string
          category: string
          clientId: number
          createdAt: string
          currentStage: string
          deadline: string
          deliveredOnTime: boolean | null
          estimatedHours: number | null
          id: number
          linkedPostId: number | null
          name: string
          notes: string
          phase: string
          priority: string
          sopReference: string | null
          stagePipeline: Json
          status: string
          updatedAt: string
        }
        Insert: {
          activityLog?: Json
          assetLinks?: Json
          assignedNode?: string
          brief?: string
          category?: string
          clientId: number
          createdAt?: string
          currentStage?: string
          deadline?: string
          deliveredOnTime?: boolean | null
          estimatedHours?: number | null
          id?: number
          linkedPostId?: number | null
          name: string
          notes?: string
          phase?: string
          priority?: string
          sopReference?: string | null
          stagePipeline?: Json
          status?: string
          updatedAt?: string
        }
        Update: {
          activityLog?: Json
          assetLinks?: Json
          assignedNode?: string
          brief?: string
          category?: string
          clientId?: number
          createdAt?: string
          currentStage?: string
          deadline?: string
          deliveredOnTime?: boolean | null
          estimatedHours?: number | null
          id?: number
          linkedPostId?: number | null
          name?: string
          notes?: string
          phase?: string
          priority?: string
          sopReference?: string | null
          stagePipeline?: Json
          status?: string
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_clientId_fkey"
            columns: ["clientId"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
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
