import { supabase } from '@/integrations/supabase/client';

export const authenticateStudent = async (admissionNumber: string, dateOfBirth: string) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('admission_number', admissionNumber)
      .eq('date_of_birth', dateOfBirth)
      .single();

    if (error) {
      throw new Error('Student not found or invalid credentials');
    }

    return data;
  } catch (error) {
    console.error('Student authentication error:', error);
    throw error;
  }
};