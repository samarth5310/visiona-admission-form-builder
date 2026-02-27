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
          last_exam_marks: string | null
          last_school_board: string | null
          mother_name: string
          mother_occupation: string
          payment_date: string
          payment_status: string
          pincode: string
          state: string
          street: string
          student_photo: string
          total_fees: number
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
          last_exam_marks?: string | null
          last_school_board?: string | null
          mother_name: string
          mother_occupation: string
          payment_date: string
          payment_status: string
          pincode: string
          state: string
          street: string
          student_photo: string
          total_fees: number
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
          last_exam_marks?: string | null
          last_school_board?: string | null
          mother_name?: string
          mother_occupation?: string
          payment_date?: string
          payment_status?: string
          pincode?: string
          state?: string
          street?: string
          student_photo?: string
          total_fees?: number
          transaction_id?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          class: string
          created_at: string
          date: string
          id: string
          status: string
          student_id: string
          student_name: string
        }
        Insert: {
          class: string
          created_at?: string
          date: string
          id?: string
          status: string
          student_id: string
          student_name: string
        }
        Update: {
          class?: string
          created_at?: string
          date?: string
          id?: string
          status?: string
          student_id?: string
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      authorized_users: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          role: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      exam_content: {
        Row: {
          id: string
          exam_type: string
          content_type: string
          language: string
          subject: string | null
          topic: string | null
          data: Json
          is_from_pyp: boolean
          year: number | null
          target_class: string | null
          target_student_id: string | null
          assigned_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          exam_type: string
          content_type: string
          language?: string
          subject?: string | null
          topic?: string | null
          data: Json
          is_from_pyp?: boolean
          year?: number | null
          target_class?: string | null
          target_student_id?: string | null
          assigned_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          exam_type?: string
          content_type?: string
          language?: string
          subject?: string | null
          topic?: string | null
          data?: Json
          is_from_pyp?: boolean
          year?: number | null
          target_class?: string | null
          target_student_id?: string | null
          assigned_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      fee_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
          student_id: string
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method: string
          student_id: string
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          student_id?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      homework: {
        Row: {
          assigned_date: string
          class: string
          created_at: string
          description: string
          due_date: string
          id: string
          subject: string
          title: string
        }
        Insert: {
          assigned_date: string
          class: string
          created_at?: string
          description: string
          due_date: string
          id?: string
          subject: string
          title: string
        }
        Update: {
          assigned_date?: string
          class?: string
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          subject?: string
          title?: string
        }
        Relationships: []
      }
      institution_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          value?: Json
        }
        Relationships: []
      }
      student_fees: {
        Row: {
          amount_paid: number
          created_at: string
          id: string
          last_payment_date: string | null
          payment_status: string
          student_id: string
          total_fees: number
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          id?: string
          last_payment_date?: string | null
          payment_status?: string
          student_id: string
          total_fees: number
        }
        Update: {
          amount_paid?: number
          created_at?: string
          id?: string
          last_payment_date?: string | null
          payment_status?: string
          student_id?: string
          total_fees?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      student_marks: {
        Row: {
          created_at: string
          exam_name: string
          id: string
          marks_obtained: number
          max_marks: number
          student_id: string
          subject: string
        }
        Insert: {
          created_at?: string
          exam_name: string
          id?: string
          marks_obtained: number
          max_marks: number
          student_id: string
          subject: string
        }
        Update: {
          created_at?: string
          exam_name?: string
          id?: string
          marks_obtained?: number
          max_marks?: number
          student_id?: string
          subject?: string
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
      student_quiz_results: {
        Row: {
          id: string
          student_id: string | null
          exam_type: string
          content_id: string | null
          score: number
          total_questions: number
          quiz_data: Json
          language: string
          attempt_number: number
          created_at: string
        }
        Insert: {
          id?: string
          student_id?: string | null
          exam_type: string
          content_id?: string | null
          score: number
          total_questions: number
          quiz_data: Json
          language?: string
          attempt_number?: number
          created_at?: string
        }
        Update: {
          id?: string
          student_id?: string | null
          exam_type?: string
          content_id?: string | null
          score?: number
          total_questions?: number
          quiz_data?: Json
          language?: string
          attempt_number?: number
          created_at?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database['public']

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
    Database[PublicTableNameOrOptions['schema']]['Views'])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
    Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
    PublicSchema['Views'])
  ? (PublicSchema['Tables'] &
    PublicSchema['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
  ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema['Tables']
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
  ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema['Enums']
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
  ? PublicSchema['Enums'][PublicEnumNameOrOptions]
  : never
