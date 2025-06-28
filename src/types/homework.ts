
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
  assigned_to_class: string;
  assigned_to_students: string[];
}
