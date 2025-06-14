
import { supabase } from '@/integrations/supabase/client';

export interface FormSubmissionData {
  admissionNumber: string;
  admissionType: string;
  fullName: string;
  dateOfBirth: Date;
  gender: string;
  currentSchool: string;
  class: string;
  aadhaarNumber: string;
  fatherName: string;
  motherName: string;
  fatherOccupation: string;
  motherOccupation: string;
  contactNumber: string;
  email: string;
  satsNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  pinCode: string;
  landmark?: string;
  lastYearPercentage: number;
  subjectsWeakIn?: string;
  category: string;
  examsPreparingFor: string[];
  paymentMode: string;
  transactionId: string;
  amountPaid: number;
  place: string;
  declarationDate: Date;
  studentPhoto?: FileList;
  previousMarksheet?: FileList;
  aadhaarCard?: FileList;
  incomeCertificate?: FileList;
  casteCertificate?: FileList;
}

export interface UploadedDocument {
  documentType: string;
  filePath: string;
  fileName: string;
  publicUrl: string;
}

const uploadFile = async (file: File, documentType: string, applicationId: string): Promise<UploadedDocument | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${applicationId}_${documentType}.${fileExt}`;
    const filePath = `${applicationId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('form-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('form-documents')
      .getPublicUrl(filePath);

    return {
      documentType,
      filePath,
      fileName,
      publicUrl
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
};

export const submitApplicationForm = async (formData: FormSubmissionData): Promise<{ success: boolean; applicationId?: string; error?: string }> => {
  try {
    // Insert application data
    const { data: application, error: applicationError } = await supabase
      .from('applications')
      .insert({
        admission_number: formData.admissionNumber,
        admission_type: formData.admissionType,
        full_name: formData.fullName,
        date_of_birth: formData.dateOfBirth.toISOString().split('T')[0],
        gender: formData.gender,
        current_school: formData.currentSchool,
        class: formData.class,
        aadhaar_number: formData.aadhaarNumber,
        father_name: formData.fatherName,
        mother_name: formData.motherName,
        father_occupation: formData.fatherOccupation,
        mother_occupation: formData.motherOccupation,
        contact_number: formData.contactNumber,
        email: formData.email,
        sats_number: formData.satsNumber,
        street_address: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        pin_code: formData.pinCode,
        landmark: formData.landmark || null,
        last_year_percentage: formData.lastYearPercentage,
        subjects_weak_in: formData.subjectsWeakIn || null,
        category: formData.category,
        exams_preparing_for: formData.examsPreparingFor,
        payment_mode: formData.paymentMode,
        transaction_id: formData.transactionId,
        amount_paid: formData.amountPaid,
        place: formData.place,
        declaration_date: formData.declarationDate.toISOString().split('T')[0]
      })
      .select()
      .single();

    if (applicationError) {
      console.error('Application insert error:', applicationError);
      return { success: false, error: 'Failed to save application data' };
    }

    const applicationId = application.id;
    const documentsToUpload: Array<{ files: FileList; type: string }> = [];

    // Prepare files for upload
    if (formData.studentPhoto && formData.studentPhoto.length > 0) {
      documentsToUpload.push({ files: formData.studentPhoto, type: 'student_photo' });
    }
    if (formData.previousMarksheet && formData.previousMarksheet.length > 0) {
      documentsToUpload.push({ files: formData.previousMarksheet, type: 'previous_marksheet' });
    }
    if (formData.aadhaarCard && formData.aadhaarCard.length > 0) {
      documentsToUpload.push({ files: formData.aadhaarCard, type: 'aadhaar_card' });
    }
    if (formData.incomeCertificate && formData.incomeCertificate.length > 0) {
      documentsToUpload.push({ files: formData.incomeCertificate, type: 'income_certificate' });
    }
    if (formData.casteCertificate && formData.casteCertificate.length > 0) {
      documentsToUpload.push({ files: formData.casteCertificate, type: 'caste_certificate' });
    }

    // Upload files and store document records
    for (const { files, type } of documentsToUpload) {
      const file = files[0];
      const uploadedDoc = await uploadFile(file, type, applicationId);
      
      if (uploadedDoc) {
        const { error: docError } = await supabase
          .from('application_documents')
          .insert({
            application_id: applicationId,
            document_type: uploadedDoc.documentType,
            file_path: uploadedDoc.filePath,
            file_name: uploadedDoc.fileName
          });

        if (docError) {
          console.error('Document record insert error:', docError);
        }
      }
    }

    return { success: true, applicationId };
  } catch (error) {
    console.error('Form submission error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
};

export const getApplicationWithDocuments = async (applicationId: string) => {
  try {
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError) {
      console.error('Error fetching application:', appError);
      return null;
    }

    const { data: documents, error: docsError } = await supabase
      .from('application_documents')
      .select('*')
      .eq('application_id', applicationId);

    if (docsError) {
      console.error('Error fetching documents:', docsError);
      return { ...application, documents: [] };
    }

    // Get public URLs for documents
    const documentsWithUrls = documents.map(doc => {
      const { data: { publicUrl } } = supabase.storage
        .from('form-documents')
        .getPublicUrl(doc.file_path);
      
      return {
        ...doc,
        publicUrl
      };
    });

    return { ...application, documents: documentsWithUrls };
  } catch (error) {
    console.error('Error getting application with documents:', error);
    return null;
  }
};
