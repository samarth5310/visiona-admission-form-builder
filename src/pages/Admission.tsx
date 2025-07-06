
import React from 'react';
import AdmissionForm from '@/components/AdmissionForm';
import AdminLayout from '@/components/AdminLayout';

const Admission = () => {
  return (
    <AdminLayout 
      activeSection="admission" 
      title="ADMISSION MANAGEMENT"
      description="Student Application and Admission Processing"
    >
      <div className="p-6">
        <AdmissionForm />
      </div>
    </AdminLayout>
  );
};

export default Admission;
