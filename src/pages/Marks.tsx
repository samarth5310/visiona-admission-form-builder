
import React from 'react';
import MarksManagement from '@/components/MarksManagement';
import AdminLayout from '@/components/AdminLayout';

const Marks = () => {
  return (
    <AdminLayout 
      activeSection="marks" 
      title="MARKS MANAGEMENT"
      description="Student Test Scores and Performance Tracking"
    >
      <div className="p-6">
        <MarksManagement />
      </div>
    </AdminLayout>
  );
};

export default Marks;
