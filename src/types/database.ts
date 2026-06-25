export type EventStatus = "ready" | "open" | "matching" | "confirmed" | "closed";

export type Database = {
  public: {
    Tables: {
      mokjangs: {
        Row: {
          id: string;
          name: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          event_date: string;
          status: EventStatus;
          created_at: string;
          started_at: string | null;
          confirmed_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          event_date: string;
          status?: EventStatus;
          created_at?: string;
          started_at?: string | null;
          confirmed_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          event_date?: string;
          status?: EventStatus;
          created_at?: string;
          started_at?: string | null;
          confirmed_at?: string | null;
        };
        Relationships: [];
      };
      people: {
        Row: {
          id: string;
          name: string;
          normalized_name: string;
          mokjang_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          normalized_name: string;
          mokjang_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          normalized_name?: string;
          mokjang_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "people_mokjang_id_fkey";
            columns: ["mokjang_id"];
            isOneToOne: false;
            referencedRelation: "mokjangs";
            referencedColumns: ["id"];
          },
        ];
      };
      attendances: {
        Row: {
          id: string;
          event_id: string;
          person_id: string;
          checked_in_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          person_id: string;
          checked_in_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          person_id?: string;
          checked_in_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendances_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attendances_person_id_fkey";
            columns: ["person_id"];
            isOneToOne: false;
            referencedRelation: "people";
            referencedColumns: ["id"];
          },
        ];
      };
      separation_rules: {
        Row: {
          id: string;
          person_a_id: string;
          person_b_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          person_a_id: string;
          person_b_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          person_a_id?: string;
          person_b_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "separation_rules_person_a_id_fkey";
            columns: ["person_a_id"];
            isOneToOne: false;
            referencedRelation: "people";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "separation_rules_person_b_id_fkey";
            columns: ["person_b_id"];
            isOneToOne: false;
            referencedRelation: "people";
            referencedColumns: ["id"];
          },
        ];
      };
      small_groups: {
        Row: {
          id: string;
          event_id: string;
          group_number: number;
          is_confirmed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          group_number: number;
          is_confirmed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          group_number?: number;
          is_confirmed?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "small_groups_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
        ];
      };
      small_group_members: {
        Row: {
          id: string;
          small_group_id: string;
          person_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          small_group_id: string;
          person_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          small_group_id?: string;
          person_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "small_group_members_person_id_fkey";
            columns: ["person_id"];
            isOneToOne: false;
            referencedRelation: "people";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "small_group_members_small_group_id_fkey";
            columns: ["small_group_id"];
            isOneToOne: false;
            referencedRelation: "small_groups";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
