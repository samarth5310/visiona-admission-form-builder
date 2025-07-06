
import React from 'react';
import FeesManagement from '@/components/FeesManagement';
import AdminLayout from '@/components/AdminLayout';

const Fees = () => {
  return (
    <AdminLayout 
      activeSection="fees" 
      title="FEES MANAGEMENT"
      description="Student Fee Tracking and Payment Management"
    >
      <div className="p-6">
        <FeesManagement />
      </div>
    </AdminLayout>
  );
};

export default Fees;
