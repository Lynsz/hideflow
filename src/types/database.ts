export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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

export type WorkMode = "remote" | "hybrid" | "onsite";

export type EmploymentType =
  "clt" | "pj" | "internship" | "freelance" | "temporary" | "other";

export type ContactType =
  | "recruiter"
  | "tech_recruiter"
  | "hr"
  | "hiring_manager"
  | "technical_interviewer"
  | "developer"
  | "manager"
  | "other";

export type InterviewType =
  | "hr"
  | "technical"
  | "behavioral"
  | "culture"
  | "manager"
  | "pair_programming"
  | "technical_challenge"
  | "final"
  | "other";

export type InterviewResult =
  "scheduled" | "completed" | "passed" | "failed" | "cancelled" | "rescheduled";

export type InterviewEventType =
  "created" | Exclude<InterviewResult, "scheduled">;

export type DocumentType =
  | "resume"
  | "cover_letter"
  | "technical_challenge"
  | "portfolio"
  | "certificate"
  | "other";

export type SupportedCurrency = "BRL" | "USD" | "EUR";

export type AnalyticsPeriod = "3m" | "6m" | "12m" | "all";

export type ApplicationActivityType =
  "note" | "email" | "phone_call" | "linkedin" | "other";

export type OfferSalaryPeriod = "monthly" | "annual";

type Timestamp = string;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          default_currency: SupportedCurrency;
          analytics_period: AnalyticsPeriod;
          weekly_application_target: number;
          weekly_follow_up_target: number;
          weekly_outreach_target: number;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id: string;
          full_name?: string;
          avatar_url?: string | null;
          default_currency?: SupportedCurrency;
          analytics_period?: AnalyticsPeriod;
          weekly_application_target?: number;
          weekly_follow_up_target?: number;
          weekly_outreach_target?: number;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: {
          full_name?: string;
          avatar_url?: string | null;
          default_currency?: SupportedCurrency;
          analytics_period?: AnalyticsPeriod;
          weekly_application_target?: number;
          weekly_follow_up_target?: number;
          weekly_outreach_target?: number;
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
          company_id: string;
          job_title: string;
          job_url: string | null;
          location: string | null;
          work_mode: WorkMode | null;
          employment_type: EmploymentType | null;
          salary_min: number | null;
          salary_max: number | null;
          currency: string;
          applied_at: string | null;
          source: string | null;
          description: string | null;
          notes: string | null;
          status: ApplicationStatus;
          archived_at: Timestamp | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id: string;
          job_title: string;
          job_url?: string | null;
          location?: string | null;
          work_mode?: WorkMode | null;
          employment_type?: EmploymentType | null;
          salary_min?: number | null;
          salary_max?: number | null;
          currency?: string;
          applied_at?: string | null;
          source?: string | null;
          description?: string | null;
          notes?: string | null;
          status?: ApplicationStatus;
          archived_at?: Timestamp | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["applications"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "applications_company_owner_fkey";
            columns: ["company_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id", "user_id"];
          },
        ];
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
          contact_type: ContactType | null;
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
          contact_type?: ContactType | null;
          notes?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["contacts"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "contacts_company_owner_fkey";
            columns: ["company_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "companies";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      application_contacts: {
        Row: {
          application_id: string;
          contact_id: string;
          user_id: string;
          created_at: Timestamp;
        };
        Insert: {
          application_id: string;
          contact_id: string;
          user_id: string;
          created_at?: Timestamp;
        };
        Update: Partial<
          Database["public"]["Tables"]["application_contacts"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "application_contacts_application_owner_fkey";
            columns: ["application_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "application_contacts_contact_owner_fkey";
            columns: ["contact_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      interviews: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          type: InterviewType;
          scheduled_at: Timestamp;
          contact_id: string | null;
          interviewer_name: string | null;
          meeting_url: string | null;
          notes: string | null;
          result: InterviewResult;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          type: InterviewType;
          scheduled_at: Timestamp;
          contact_id?: string | null;
          interviewer_name?: string | null;
          meeting_url?: string | null;
          notes?: string | null;
          result?: InterviewResult;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["interviews"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "interviews_application_owner_fkey";
            columns: ["application_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "interviews_contact_owner_fkey";
            columns: ["contact_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "contacts";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      interview_preparations: {
        Row: {
          id: string;
          user_id: string;
          interview_id: string;
          company_research: string | null;
          role_alignment: string | null;
          star_stories: string | null;
          questions_to_ask: string | null;
          logistics_notes: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          user_id: string;
          interview_id: string;
          company_research?: string | null;
          role_alignment?: string | null;
          star_stories?: string | null;
          questions_to_ask?: string | null;
          logistics_notes?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<
          Database["public"]["Tables"]["interview_preparations"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "interview_preparations_interview_owner_fkey";
            columns: ["interview_id", "user_id"];
            isOneToOne: true;
            referencedRelation: "interviews";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      interview_events: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          interview_id: string | null;
          event_type: InterviewEventType;
          interview_type: InterviewType;
          result: InterviewResult | null;
          scheduled_at: Timestamp;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          interview_id?: string | null;
          event_type: InterviewEventType;
          interview_type: InterviewType;
          result?: InterviewResult | null;
          scheduled_at: Timestamp;
          created_at?: Timestamp;
        };
        Update: Partial<
          Database["public"]["Tables"]["interview_events"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "interview_events_application_owner_fkey";
            columns: ["application_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "interview_events_interview_owner_fkey";
            columns: ["interview_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "interviews";
            referencedColumns: ["id", "user_id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "application_history_application_owner_fkey";
            columns: ["application_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      application_activities: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          activity_type: ApplicationActivityType;
          title: string;
          notes: string | null;
          occurred_at: Timestamp;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          activity_type: ApplicationActivityType;
          title: string;
          notes?: string | null;
          occurred_at: Timestamp;
          created_at?: Timestamp;
        };
        Update: Partial<
          Database["public"]["Tables"]["application_activities"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "application_activities_application_owner_fkey";
            columns: ["application_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      application_offers: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          salary_amount: number;
          salary_period: OfferSalaryPeriod;
          currency: SupportedCurrency;
          bonus_amount: number | null;
          equity: string | null;
          benefits: string | null;
          received_at: string;
          decision_deadline: string | null;
          notes: string | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          salary_amount: number;
          salary_period: OfferSalaryPeriod;
          currency: SupportedCurrency;
          bonus_amount?: number | null;
          equity?: string | null;
          benefits?: string | null;
          received_at: string;
          decision_deadline?: string | null;
          notes?: string | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<
          Database["public"]["Tables"]["application_offers"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "application_offers_application_owner_fkey";
            columns: ["application_id", "user_id"];
            isOneToOne: true;
            referencedRelation: "applications";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          name: string;
          original_name: string;
          storage_path: string;
          document_type: DocumentType;
          mime_type: string;
          file_size: number;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          name: string;
          original_name: string;
          storage_path: string;
          document_type: DocumentType;
          mime_type: string;
          file_size: number;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["documents"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "documents_application_owner_fkey";
            columns: ["application_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          application_id: string;
          title: string;
          notes: string | null;
          due_at: Timestamp;
          completed_at: Timestamp | null;
          created_at: Timestamp;
          updated_at: Timestamp;
        };
        Insert: {
          id?: string;
          user_id: string;
          application_id: string;
          title: string;
          notes?: string | null;
          due_at: Timestamp;
          completed_at?: Timestamp | null;
          created_at?: Timestamp;
          updated_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["reminders"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "reminders_application_owner_fkey";
            columns: ["application_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      technologies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          normalized_name: string;
          created_at: Timestamp;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: Timestamp;
        };
        Update: Partial<Database["public"]["Tables"]["technologies"]["Insert"]>;
        Relationships: [];
      };
      application_technologies: {
        Row: {
          application_id: string;
          technology_id: string;
          user_id: string;
          created_at: Timestamp;
        };
        Insert: {
          application_id: string;
          technology_id: string;
          user_id: string;
          created_at?: Timestamp;
        };
        Update: Partial<
          Database["public"]["Tables"]["application_technologies"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "application_technologies_application_owner_fkey";
            columns: ["application_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "applications";
            referencedColumns: ["id", "user_id"];
          },
          {
            foreignKeyName: "application_technologies_technology_owner_fkey";
            columns: ["technology_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "technologies";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      import_applications_csv: {
        Args: { p_rows: Json };
        Returns: Json;
      };
    };
    Enums: {
      application_status: ApplicationStatus;
      application_activity_type: ApplicationActivityType;
      offer_salary_period: OfferSalaryPeriod;
    };
    CompositeTypes: Record<string, never>;
  };
};
