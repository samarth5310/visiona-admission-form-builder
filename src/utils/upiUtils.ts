
import { supabase } from "@/integrations/supabase/client";

export const generateUPIUri = (upiId: string, name: string, amount: number, transactionId: string) => {
    const encodedName = encodeURIComponent(name);
    const encodedNote = encodeURIComponent(`Fee Payment - ${transactionId}`);
    return `upi://pay?pa=${upiId}&pn=${encodedName}&am=${amount}&cu=INR&tn=${encodedNote}`;
};

export const getInstitutionSettings = async () => {
    const { data, error } = await supabase
        .from('institution_settings')
        .select('*')
        .single();

    if (error) {
        console.error('Error fetching institution settings:', error);
        return null;
    }
    return data;
};
