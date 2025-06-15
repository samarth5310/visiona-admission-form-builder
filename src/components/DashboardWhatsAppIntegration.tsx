
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from 'lucide-react';
import StudentSelector from './StudentSelector';
import WhatsAppMessaging from './WhatsAppMessaging';

interface Student {
  id: string;
  full_name: string;
  class: string;
  contact_number: string;
  total_fees: number;
  paid_amount: number;
  pending_amount: number;
  payment_status: string;
}

const DashboardWhatsAppIntegration = () => {
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowWhatsAppModal(true);
  };

  const handleCloseWhatsApp = () => {
    setShowWhatsAppModal(false);
    setSelectedStudent(null);
  };

  return (
    <>
      <Button
        onClick={() => setShowStudentSelector(true)}
        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
      >
        <MessageCircle className="h-4 w-4" />
        Send WhatsApp Message
      </Button>

      <StudentSelector
        isOpen={showStudentSelector}
        onClose={() => setShowStudentSelector(false)}
        onSelectStudent={handleSelectStudent}
      />

      {selectedStudent && (
        <WhatsAppMessaging
          studentName={selectedStudent.full_name}
          amountPaid={selectedStudent.paid_amount}
          paymentDate={new Date().toISOString().split('T')[0]}
          paymentType="Fee Update"
          dueAmount={selectedStudent.pending_amount}
          phoneNumber={selectedStudent.contact_number}
          isOpen={showWhatsAppModal}
          onClose={handleCloseWhatsApp}
        />
      )}
    </>
  );
};

export default DashboardWhatsAppIntegration;
