
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface StudentSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent: (student: Student) => void;
}

const StudentSelector = ({ isOpen, onClose, onSelectStudent }: StudentSelectorProps) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchStudents();
    }
  }, [isOpen]);

  useEffect(() => {
    const query = searchTerm.toLowerCase();
    const filtered = students.filter(student =>
      (student.full_name || '').toLowerCase().includes(query) ||
      (student.class || '').toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          full_name,
          class,
          contact_number,
          student_fees (
            total_fees,
            paid_amount,
            pending_amount,
            payment_status
          )
        `)
        .order('full_name');

      if (error) throw error;

      const studentsWithFees: Student[] = data.map(student => {
        const studentFees = Array.isArray(student.student_fees)
          ? student.student_fees[0]
          : student.student_fees;

        return {
          id: student.id,
          full_name: student.full_name,
          class: student.class || 'Not specified',
          contact_number: student.contact_number || '',
          total_fees: studentFees?.total_fees || 0,
          paid_amount: studentFees?.paid_amount || 0,
          pending_amount: studentFees?.pending_amount || 0,
          payment_status: studentFees?.payment_status || 'not_set'
        };
      });

      setStudents(studentsWithFees);
      setFilteredStudents(studentsWithFees);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'partial': return 'text-yellow-600';
      case 'pending': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleSelectStudent = (student: Student) => {
    if (!student.contact_number) {
      toast({
        title: "No Contact Number",
        description: "This student doesn't have a contact number on file.",
        variant: "destructive",
      });
      return;
    }
    onSelectStudent(student);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Select Student for WhatsApp
          </DialogTitle>
          <DialogDescription className="sr-only">
            Search and select a student to send a WhatsApp message.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search students by name or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="overflow-y-auto max-h-96 space-y-2">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No students found</p>
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 cursor-pointer transition-colors"
                  onClick={() => handleSelectStudent(student)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{student.full_name}</h3>
                      <p className="text-sm text-gray-600">Class: {student.class}</p>
                      <p className="text-sm text-gray-600">Phone: {student.contact_number || 'Not provided'}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getStatusColor(student.payment_status)}`}>
                        {student.payment_status.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Pending: {formatCurrency(student.pending_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudentSelector;
