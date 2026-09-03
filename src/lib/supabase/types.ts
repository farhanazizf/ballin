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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          checked_in_at: string | null
          method: string
          player_id: string
          recorded_by: string | null
          session_date: string
          session_id: string
          status: Database["public"]["Enums"]["attendance_status"]
        }
        Insert: {
          checked_in_at?: string | null
          method?: string
          player_id: string
          recorded_by?: string | null
          session_date: string
          session_id: string
          status: Database["public"]["Enums"]["attendance_status"]
        }
        Update: {
          checked_in_at?: string | null
          method?: string
          player_id?: string
          recorded_by?: string | null
          session_date?: string
          session_id?: string
          status?: Database["public"]["Enums"]["attendance_status"]
        }
        Relationships: [
          {
            foreignKeyName: "attendance_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      badges: {
        Row: {
          code: string
          criteria: Json
          description: string | null
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          code: string
          criteria: Json
          description?: string | null
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          code?: string
          criteria?: Json
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      box_scores: {
        Row: {
          assists: number | null
          blocks: number | null
          dreb: number | null
          fga: number | null
          fgm: number | null
          fouls: number | null
          fta: number | null
          ftm: number | null
          match_id: string
          minutes: number | null
          oreb: number | null
          player_id: string
          points: number | null
          steals: number | null
          tpa: number | null
          tpm: number | null
          turnovers: number | null
        }
        Insert: {
          assists?: number | null
          blocks?: number | null
          dreb?: number | null
          fga?: number | null
          fgm?: number | null
          fouls?: number | null
          fta?: number | null
          ftm?: number | null
          match_id: string
          minutes?: number | null
          oreb?: number | null
          player_id: string
          points?: number | null
          steals?: number | null
          tpa?: number | null
          tpm?: number | null
          turnovers?: number | null
        }
        Update: {
          assists?: number | null
          blocks?: number | null
          dreb?: number | null
          fga?: number | null
          fgm?: number | null
          fouls?: number | null
          fta?: number | null
          ftm?: number | null
          match_id?: string
          minutes?: number | null
          oreb?: number | null
          player_id?: string
          points?: number | null
          steals?: number | null
          tpa?: number | null
          tpm?: number | null
          turnovers?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "box_scores_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "box_scores_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "box_scores_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_teams: {
        Row: {
          coach_id: string
          team_id: string
        }
        Insert: {
          coach_id: string
          team_id: string
        }
        Update: {
          coach_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_teams_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      drill_events: {
        Row: {
          client_event_id: string
          created_at: string
          device_id: string
          id: string
          occurred_at: string
          player_id: string
          recorded_by: string
          result: string
          session_drill_id: string
          value: number | null
          voided_at: string | null
        }
        Insert: {
          client_event_id: string
          created_at?: string
          device_id: string
          id?: string
          occurred_at: string
          player_id: string
          recorded_by: string
          result: string
          session_drill_id: string
          value?: number | null
          voided_at?: string | null
        }
        Update: {
          client_event_id?: string
          created_at?: string
          device_id?: string
          id?: string
          occurred_at?: string
          player_id?: string
          recorded_by?: string
          result?: string
          session_drill_id?: string
          value?: number | null
          voided_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drill_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drill_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drill_events_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drill_events_session_drill_id_fkey"
            columns: ["session_drill_id"]
            isOneToOne: false
            referencedRelation: "session_drills"
            referencedColumns: ["id"]
          },
        ]
      }
      drill_results: {
        Row: {
          attempts: number
          is_dnp: boolean
          made: number
          overridden: boolean
          player_id: string
          session_drill_id: string
          updated_at: string
          value: number | null
        }
        Insert: {
          attempts?: number
          is_dnp?: boolean
          made?: number
          overridden?: boolean
          player_id: string
          session_drill_id: string
          updated_at?: string
          value?: number | null
        }
        Update: {
          attempts?: number
          is_dnp?: boolean
          made?: number
          overridden?: boolean
          player_id?: string
          session_drill_id?: string
          updated_at?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "drill_results_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drill_results_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drill_results_session_drill_id_fkey"
            columns: ["session_drill_id"]
            isOneToOne: false
            referencedRelation: "session_drills"
            referencedColumns: ["id"]
          },
        ]
      }
      drills: {
        Row: {
          attribute_weights: Json
          category: string
          created_at: string
          default_target: number | null
          id: string
          instructions: string | null
          is_archived: boolean
          lower_is_better: boolean
          name: string
          organization_id: string
          type: Database["public"]["Enums"]["drill_type"]
          unit: string | null
          video_url: string | null
        }
        Insert: {
          attribute_weights?: Json
          category: string
          created_at?: string
          default_target?: number | null
          id?: string
          instructions?: string | null
          is_archived?: boolean
          lower_is_better?: boolean
          name: string
          organization_id: string
          type: Database["public"]["Enums"]["drill_type"]
          unit?: string | null
          video_url?: string | null
        }
        Update: {
          attribute_weights?: Json
          category?: string
          created_at?: string
          default_target?: number | null
          id?: string
          instructions?: string | null
          is_archived?: boolean
          lower_is_better?: boolean
          name?: string
          organization_id?: string
          type?: Database["public"]["Enums"]["drill_type"]
          unit?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drills_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          id: string
          location: string | null
          match_type: string
          notes: string | null
          opponent: string
          organization_id: string
          played_at: string
          score_against: number | null
          score_for: number | null
          team_id: string
        }
        Insert: {
          id?: string
          location?: string | null
          match_type: string
          notes?: string | null
          opponent: string
          organization_id: string
          played_at: string
          score_against?: number | null
          score_for?: number | null
          team_id: string
        }
        Update: {
          id?: string
          location?: string | null
          match_type?: string
          notes?: string | null
          opponent?: string
          organization_id?: string
          played_at?: string
          score_against?: number | null
          score_for?: number | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          primary_color: string | null
          slug: string
          timezone: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          primary_color?: string | null
          slug: string
          timezone?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          slug?: string
          timezone?: string
        }
        Relationships: []
      }
      player_attributes: {
        Row: {
          archetype: string | null
          archetype_locked: boolean
          athleticism: number | null
          attitude: number | null
          ballhandling: number | null
          computed_at: string
          data_sufficient: boolean
          defense: number | null
          finishing: number | null
          period_end: string
          period_start: string
          player_id: string
          shooting: number | null
        }
        Insert: {
          archetype?: string | null
          archetype_locked?: boolean
          athleticism?: number | null
          attitude?: number | null
          ballhandling?: number | null
          computed_at?: string
          data_sufficient?: boolean
          defense?: number | null
          finishing?: number | null
          period_end: string
          period_start: string
          player_id: string
          shooting?: number | null
        }
        Update: {
          archetype?: string | null
          archetype_locked?: boolean
          athleticism?: number | null
          attitude?: number | null
          ballhandling?: number | null
          computed_at?: string
          data_sufficient?: boolean
          defense?: number | null
          finishing?: number | null
          period_end?: string
          period_start?: string
          player_id?: string
          shooting?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_attributes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_attributes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_badges: {
        Row: {
          badge_id: string
          earned_at: string
          player_id: string
          seen_at: string | null
        }
        Insert: {
          badge_id: string
          earned_at?: string
          player_id: string
          seen_at?: string | null
        }
        Update: {
          badge_id?: string
          earned_at?: string
          player_id?: string
          seen_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_badges_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_badges_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_cards: {
        Row: {
          id: string
          issued_at: string
          organization_id: string
          player_id: string
          printed_at: string | null
          revoked_at: string | null
          token: string
        }
        Insert: {
          id?: string
          issued_at?: string
          organization_id: string
          player_id: string
          printed_at?: string | null
          revoked_at?: string | null
          token?: string
        }
        Update: {
          id?: string
          issued_at?: string
          organization_id?: string
          player_id?: string
          printed_at?: string | null
          revoked_at?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_cards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_cards_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_cards_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_credentials: {
        Row: {
          failed_attempts: number
          locked_until: string | null
          pin_hash: string
          player_id: string
          username: string
        }
        Insert: {
          failed_attempts?: number
          locked_until?: string | null
          pin_hash: string
          player_id: string
          username: string
        }
        Update: {
          failed_attempts?: number
          locked_until?: string | null
          pin_hash?: string
          player_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_credentials_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "player_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_credentials_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_measurements: {
        Row: {
          height_cm: number | null
          id: string
          measured_on: string
          player_id: string
          standing_reach_cm: number | null
          weight_kg: number | null
          wingspan_cm: number | null
        }
        Insert: {
          height_cm?: number | null
          id?: string
          measured_on: string
          player_id: string
          standing_reach_cm?: number | null
          weight_kg?: number | null
          wingspan_cm?: number | null
        }
        Update: {
          height_cm?: number | null
          id?: string
          measured_on?: string
          player_id?: string
          standing_reach_cm?: number | null
          weight_kg?: number | null
          wingspan_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "player_measurements_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_measurements_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_notes: {
        Row: {
          created_at: string
          created_by: string
          id: string
          kind: string
          note: string
          player_id: string
          session_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          kind?: string
          note: string
          player_id: string
          session_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          kind?: string
          note?: string
          player_id?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_notes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_notes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_notes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          birth_date: string
          consent_given_at: string | null
          consent_given_by: string | null
          created_at: string
          dominant_hand: string | null
          full_name: string
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          jersey_number: number | null
          joined_at: string
          nickname: string
          organization_id: string
          photo_path: string | null
          position: string | null
          profile_id: string | null
          school: string | null
          status: string
        }
        Insert: {
          birth_date: string
          consent_given_at?: string | null
          consent_given_by?: string | null
          created_at?: string
          dominant_hand?: string | null
          full_name: string
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          jersey_number?: number | null
          joined_at?: string
          nickname: string
          organization_id: string
          photo_path?: string | null
          position?: string | null
          profile_id?: string | null
          school?: string | null
          status?: string
        }
        Update: {
          birth_date?: string
          consent_given_at?: string | null
          consent_given_by?: string | null
          created_at?: string
          dominant_hand?: string | null
          full_name?: string
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          jersey_number?: number | null
          joined_at?: string
          nickname?: string
          organization_id?: string
          photo_path?: string | null
          position?: string | null
          profile_id?: string | null
          school?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          is_active?: boolean
          organization_id: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          ai_draft: Json | null
          approved_at: string | null
          approved_by: string | null
          content: Json
          id: string
          pdf_path: string | null
          period_end: string
          period_start: string
          player_id: string
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          ai_draft?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          content: Json
          id?: string
          pdf_path?: string | null
          period_end: string
          period_start: string
          player_id: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          ai_draft?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          content?: Json
          id?: string
          pdf_path?: string | null
          period_end?: string
          period_start?: string
          player_id?: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      rubric_scores: {
        Row: {
          coachability: number | null
          created_at: string
          discipline: number | null
          effort: number | null
          player_id: string
          recorded_by: string
          session_id: string
        }
        Insert: {
          coachability?: number | null
          created_at?: string
          discipline?: number | null
          effort?: number | null
          player_id: string
          recorded_by: string
          session_id: string
        }
        Update: {
          coachability?: number | null
          created_at?: string
          discipline?: number | null
          effort?: number | null
          player_id?: string
          recorded_by?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rubric_scores_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rubric_scores_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rubric_scores_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rubric_scores_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_drills: {
        Row: {
          created_by: string
          drill_id: string
          finished_at: string | null
          id: string
          session_id: string
          started_at: string
          station_id: string | null
          target: number | null
          track_misses: boolean
        }
        Insert: {
          created_by: string
          drill_id: string
          finished_at?: string | null
          id?: string
          session_id: string
          started_at?: string
          station_id?: string | null
          target?: number | null
          track_misses?: boolean
        }
        Update: {
          created_by?: string
          drill_id?: string
          finished_at?: string | null
          id?: string
          session_id?: string
          started_at?: string
          station_id?: string | null
          target?: number | null
          track_misses?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "session_drills_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_drills_drill_id_fkey"
            columns: ["drill_id"]
            isOneToOne: false
            referencedRelation: "drills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_drills_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_drills_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "session_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      session_stations: {
        Row: {
          coach_id: string | null
          id: string
          label: string
          session_id: string
          sort_order: number
        }
        Insert: {
          coach_id?: string | null
          id?: string
          label: string
          session_id: string
          sort_order?: number
        }
        Update: {
          coach_id?: string | null
          id?: string
          label?: string
          session_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "session_stations_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_stations_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          cancel_reason: string | null
          closed_at: string | null
          created_at: string
          id: string
          location: string | null
          notes: string | null
          opened_at: string | null
          organization_id: string
          scheduled_end: string | null
          scheduled_start: string
          session_type: string
          status: Database["public"]["Enums"]["session_status"]
          team_id: string
        }
        Insert: {
          cancel_reason?: string | null
          closed_at?: string | null
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          opened_at?: string | null
          organization_id: string
          scheduled_end?: string | null
          scheduled_start: string
          session_type?: string
          status?: Database["public"]["Enums"]["session_status"]
          team_id: string
        }
        Update: {
          cancel_reason?: string | null
          closed_at?: string | null
          created_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          opened_at?: string | null
          organization_id?: string
          scheduled_end?: string | null
          scheduled_start?: string
          session_type?: string
          status?: Database["public"]["Enums"]["session_status"]
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      station_players: {
        Row: {
          player_id: string
          station_id: string
        }
        Insert: {
          player_id: string
          station_id: string
        }
        Update: {
          player_id?: string
          station_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "station_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "station_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "station_players_station_id_fkey"
            columns: ["station_id"]
            isOneToOne: false
            referencedRelation: "session_stations"
            referencedColumns: ["id"]
          },
        ]
      }
      team_players: {
        Row: {
          joined_at: string
          left_at: string | null
          player_id: string
          team_id: string
        }
        Insert: {
          joined_at?: string
          left_at?: string | null
          player_id: string
          team_id: string
        }
        Update: {
          joined_at?: string
          left_at?: string | null
          player_id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          age_max: number | null
          age_min: number | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          organization_id: string
          track_drill_stats: boolean
        }
        Insert: {
          age_max?: number | null
          age_min?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          track_drill_stats?: boolean
        }
        Update: {
          age_max?: number | null
          age_min?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          track_drill_stats?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      player_card_view: {
        Row: {
          archetype: string | null
          data_sufficient: boolean | null
          id: string | null
          jersey_number: number | null
          nickname: string | null
          period_end: string | null
          period_start: string | null
          shape_athleticism: number | null
          shape_attitude: number | null
          shape_ballhandling: number | null
          shape_defense: number | null
          shape_finishing: number | null
          shape_shooting: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      auth_org_id: { Args: never; Returns: string }
      auth_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      verify_player_pin: {
        Args: { p_pin: string; p_player_id: string }
        Returns: boolean
      }
    }
    Enums: {
      attendance_status: "present" | "late" | "excused" | "sick" | "absent"
      drill_type: "attempt" | "timed" | "count_in_time" | "measure" | "rating"
      report_status: "draft" | "approved" | "sent"
      session_status: "scheduled" | "active" | "completed" | "cancelled"
      user_role: "admin" | "coach" | "player" | "parent"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      attendance_status: ["present", "late", "excused", "sick", "absent"],
      drill_type: ["attempt", "timed", "count_in_time", "measure", "rating"],
      report_status: ["draft", "approved", "sent"],
      session_status: ["scheduled", "active", "completed", "cancelled"],
      user_role: ["admin", "coach", "player", "parent"],
    },
  },
} as const
