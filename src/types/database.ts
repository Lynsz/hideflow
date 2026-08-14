export type ApplicationStatus =
  | "saved"
  | "applied"
  | "screening"
  | "hr_interview"
  | "technical_interview"
  | "technical_challenge"
  | "final_interview"
  | "offer"
  | "hired"
  | "rejected"
  | "withdrawn";

type Timestamp = string;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id: string;
          full_name?: string;
          avatar_url?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          full_name?: string;
          avatar_url?: string | null;
          updated_at?: Timestamp;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          website: string | null;
          linkedin_url: string | null;
          location: string | null;
          notes: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          website?: string | null;
          linkedin_url?: string | null;
          location?: string | null;
          notes?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
        Relationships: [];
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          company_id: string | null;
          job_title: string;
          job_url: string | null;
          location: string | null;
          work_mode: string | null;
          employment_type: string | null;
          salary_min: number | null;
          salary_max: number | null;
          currency: string;
          applied_at: string | null;
          source: string | null;
          description: string | null;
          notes: string | null;
          status: ApplicationStatus;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id?: string | null;
          job_title: string;
          job_url?: string | null;
          location?: string | null;
          work_mode?: string | null;
          employment_type?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          currency?: string;
          applied_at?: string | null;
          source?: string | null;
          description?: string | null;
          notes?: string | null;
          status?: ApplicationStatus;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["applications"]["Insert"]>;
        Relationships: [];
      };
      contacts: {
        Row: {
          id: string;
          user_id: string;
          company_id: string;
          name: string;
          role: string | null;
          email: string | null;
          phone: string | null;
          linkedin_url: string | null;
          contact_type: string | null;
          notes: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id: string;
          name: string;
          role?: string | null;
          email?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          contact_type?: string | null;
          notes?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["contacts"]["Insert"]>;
        Relationships: [];
      };
      interviews: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          type: string;
          scheduled_at: Timestamp;
          interviewer_name: string | null;
          meeting_url: string | null;
          notes: string | null;
          result: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          type: string;
          scheduled_at: Timestamp;
          interviewer_name?: string | null;
          meeting_url?: string | null;
          notes?: string | null;
          result?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["interviews"]["Insert"]>;
        Relationships: [];
      };
      application_history: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          from_status: ApplicationStatus | null;
          to_status: ApplicationStatus;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          from_status?: ApplicationStatus | null;
          to_status: ApplicationStatus;
          created_at?: Timestamp;
        };
        Update: Partial<
          Database["public"]["Tables"]["application_history"]["Insert"]
        >;
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          name: string;
          storage_path: string;
          document_type: string;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          name: string;
          storage_path: string;
          document_type: string;
          created_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      application_status: ApplicationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
