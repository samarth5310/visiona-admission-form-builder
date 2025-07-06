
import React from 'react';
import StudentsSection from '@/components/StudentsSection';
import AdminLayout from '@/components/AdminLayout';

const Students = () => {
  return (
    <AdminLayout 
      activeSection="students" 
      title="STUDENT MANAGEMENT"
      description="Student Records and Database Management"
    >
      <div className="p-6">
        <StudentsSection />
      </div>
    </AdminLayout>
  );
};

export default Students;
