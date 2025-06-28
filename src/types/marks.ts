
export interface StudentMark {
  id: string;
  student_id: string;
  subject: string;
  total_marks: number;
  marks_obtained: number;
  test_name: string;
  test_date: string;
  created_at: string;
  updated_at: string;
}

export interface MarkFormData {
  student_id: string;
  subject: string;
  total_marks: number;
  marks_obtained: number;
  test_name: string;
  test_date: string;
}

export interface StudentWithMarks {
  id: string;
  full_name: string;
  contact_number: string;
  class: string;
  marks: StudentMark[];
}
