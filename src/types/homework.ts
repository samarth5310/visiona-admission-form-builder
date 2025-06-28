export interface Homework {
  id: string;
  title: string;
  subject: string;
  description?: string;
  google_drive_link: string;
  assigned_by: string;
  assigned_to_class: string;
  assigned_to_students: string[];
  created_at: string;
  updated_at: string;
}

export interface HomeworkFormData {
  title: string;
  subject: string;
  description?: string;
  google_drive_link: string;
  assignment_type: 'class' | 'student';
  assigned_to_class: string;
  assigned_to_students: string[];
}

export interface Student {
  id: string;
  full_name: string;
  class: string;
}

export interface ClassInfo {
  class: string;
  student_count: number;
}