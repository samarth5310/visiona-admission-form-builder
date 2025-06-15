
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StudentFeeDetails from './StudentFeeDetails';

interface Student {
  id: string;
  full_name: string;
  class: string;
  contact_number: string;
  email: string;
}

interface StudentFee {
  id: string;
  application_id: string;
  total_fees: number;
  paid_amount: number;
  pending_amount: number;
  fee_category: string;
  payment_status: string;
  due_date: string | null;
}

const FeesManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('id, full_name, class, contact_number, email')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentFees = async (studentId: string) => {
    try {
      const { data, error } = await supabase
        .from('student_fees')
        .select('*')
        .eq('application_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudentFees(data || []);
    } catch (error) {
      console.error('Error fetching student fees:', error);
      toast({
        title: "Error",
        description: "Failed to fetch student fees",
        variant: "destructive",
      });
    }
  };

  const handleStudentSelect = async (student: Student) => {
    setSelectedStudent(student);
    await fetchStudentFees(student.id);
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "destructive" as const, label: "Pending" },
      partial: { variant: "secondary" as const, label: "Partial" },
      paid: { variant: "default" as const, label: "Paid" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading students...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Fees Management System</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Students List */}
            <Card>
              <CardHeader>
                <CardTitle>Students ({students.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedStudent?.id === student.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => handleStudentSelect(student)}
                    >
                      <div className="font-medium">{student.full_name}</div>
                      <div className="text-sm text-gray-600">Class: {student.class}</div>
                      <div className="text-sm text-gray-600">{student.email}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fee Overview */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedStudent ? `${selectedStudent.full_name} - Fee Details` : 'Select a Student'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStudent ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Class:</span> {selectedStudent.class}
                      </div>
                      <div>
                        <span className="font-medium">Contact:</span> {selectedStudent.contact_number}
                      </div>
                    </div>
                    
                    {studentFees.length > 0 ? (
                      <div className="space-y-3">
                        {studentFees.map((fee) => (
                          <div key={fee.id} className="border rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium capitalize">{fee.fee_category}</span>
                              {getPaymentStatusBadge(fee.payment_status)}
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">Total:</span> ₹{fee.total_fees}
                              </div>
                              <div>
                                <span className="text-gray-600">Paid:</span> ₹{fee.paid_amount}
                              </div>
                              <div>
                                <span className="text-gray-600">Pending:</span> ₹{fee.pending_amount}
                              </div>
                            </div>
                            {fee.due_date && (
                              <div className="text-sm text-gray-600 mt-1">
                                Due: {new Date(fee.due_date).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        No fee records found for this student
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Please select a student to view fee details
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Student Fee Details Component */}
          {selectedStudent && (
            <StudentFeeDetails 
              student={selectedStudent} 
              onFeeUpdate={() => fetchStudentFees(selectedStudent.id)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeesManagement;
