// Auto-generated types will go here after running supabase gen types
// For now, provide a minimal placeholder

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          primary_color: string | null;
          timezone: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          primary_color?: string | null;
          timezone?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          logo_url?: string | null;
          primary_color?: string | null;
          timezone?: string;
          created_at?: string;
        };
      };
      // Additional table types will be generated
      // after connecting to Supabase with: pnpm supabase gen types
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: 'admin' | 'coach' | 'player' | 'parent';
      drill_type: 'attempt' | 'timed' | 'count_in_time' | 'measure' | 'rating';
      session_status: 'scheduled' | 'active' | 'completed' | 'cancelled';
      attendance_status: 'present' | 'late' | 'excused' | 'sick' | 'absent';
      report_status: 'draft' | 'approved' | 'sent';
    };
  };
};
