export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      application_documents: {
        Row: {
          application_id: string
          created_at: string
          document_type: string
          file_name: string
          file_path: string
          id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          document_type: string
          file_name: string
          file_path: string
          id?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          document_type?: string
          file_name?: string
          file_path?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          aadhaar_number: string
          admission_number: string
          admission_type: string
          amount_paid: number
          category: string
          city: string
          class: string
          contact_number: string
          created_at: string
          current_school: string
          date_of_birth: string
          declaration_date: string
          email: string
          exams_preparing_for: string[]
          father_name: string
          father_occupation: string
          full_name: string
          gender: string
          id: string
          landmark: string | null
          last_year_percentage: number
          mother_name: string
          mother_occupation: string
          payment_mode: string
          pin_code: string
          place: string
          sats_number: string
          state: string
          street_address: string
          subjects_weak_in: string | null
          transaction_id: string
        }
        Insert: {
          aadhaar_number: string
          admission_number: string
          admission_type: string
          amount_paid: number
          category: string
          city: string
          class: string
          contact_number: string
          created_at?: string
          current_school: string
          date_of_birth: string
          declaration_date: string
          email: string
          exams_preparing_for: string[]
          father_name: string
          father_occupation: string
          full_name: string
          gender: string
          id?: string
          landmark?: string | null
          last_year_percentage: number
          mother_name: string
          mother_occupation: string
          payment_mode: string
          pin_code: string
          place: string
          sats_number: string
          state: string
          street_address: string
          subjects_weak_in?: string | null
          transaction_id: string
        }
        Update: {
          aadhaar_number?: string
          admission_number?: string
          admission_type?: string
          amount_paid?: number
          category?: string
          city?: string
          class?: string
          contact_number?: string
          created_at?: string
          current_school?: string
          date_of_birth?: string
          declaration_date?: string
          email?: string
          exams_preparing_for?: string[]
          father_name?: string
          father_occupation?: string
          full_name?: string
          gender?: string
          id?: string
          landmark?: string | null
          last_year_percentage?: number
          mother_name?: string
          mother_occupation?: string
          payment_mode?: string
          pin_code?: string
          place?: string
          sats_number?: string
          state?: string
          street_address?: string
          subjects_weak_in?: string | null
          transaction_id?: string
        }
        Relationships: []
      }
      authorized_users: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          mobile_number: string
          name: string | null
          password: string
          role: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          mobile_number: string
          name?: string | null
          password: string
          role?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          mobile_number?: string
          name?: string | null
          password?: string
          role?: string | null
        }
        Relationships: []
      }
      fee_payments: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          payment_amount: number
          payment_date: string
          payment_method: string
          receipt_number: string | null
          student_fees_id: string
          transaction_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          payment_amount: number
          payment_date?: string
          payment_method?: string
          receipt_number?: string | null
          student_fees_id: string
          transaction_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          payment_amount?: number
          payment_date?: string
          payment_method?: string
          receipt_number?: string | null
          student_fees_id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_student_fees_id_fkey"
            columns: ["student_fees_id"]
            isOneToOne: false
            referencedRelation: "student_fees"
            referencedColumns: ["id"]
          },
        ]
      }
      homework: {
        Row: {
          assigned_by: string
          assigned_to_class: string
          assigned_to_students: string[] | null
          created_at: string
          description: string | null
          google_drive_link: string
          id: string
          subject: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_by: string
          assigned_to_class: string
          assigned_to_students?: string[] | null
          created_at?: string
          description?: string | null
          google_drive_link: string
          id?: string
          subject: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_by?: string
          assigned_to_class?: string
          assigned_to_students?: string[] | null
          created_at?: string
          description?: string | null
          google_drive_link?: string
          id?: string
          subject?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      student_fees: {
        Row: {
          application_id: string
          created_at: string
          fee_category: string
          id: string
          paid_amount: number
          paid_date: string | null
          payment_status: string
          pending_amount: number
          total_fees: number
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          fee_category?: string
          id?: string
          paid_amount?: number
          paid_date?: string | null
          payment_status?: string
          pending_amount?: number
          total_fees?: number
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          fee_category?: string
          id?: string
          paid_amount?: number
          paid_date?: string | null
          payment_status?: string
          pending_amount?: number
          total_fees?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_fees_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      student_marks: {
        Row: {
          created_at: string
          id: string
          marks_obtained: number
          student_id: string
          subject: string
          test_date: string
          test_name: string
          total_marks: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          marks_obtained: number
          student_id: string
          subject: string
          test_date: string
          test_name: string
          total_marks: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          marks_obtained?: number
          student_id?: string
          subject?: string
          test_date?: string
          test_name?: string
          total_marks?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_marks_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      extract_drive_file_id: {
        Args: { drive_link: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
