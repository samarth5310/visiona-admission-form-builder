
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, DollarSign, Receipt, History, X } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PaymentForm from './PaymentForm';
import PaymentHistory from './PaymentHistory';

interface Student {
  id: string;
  full_name: string;
  class: string;
  contact_number: string;
  created_at: string;
  total_fees: number;
  paid_amount: number;
  pending_amount: number;
  payment_status: string;
  fee_id?: string;
}

interface FeeDetailsModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const FeeDetailsModal = ({ student, isOpen, onClose, onUpdate }: FeeDetailsModalProps) => {
  const [feeStructure, setFeeStructure] = useState({
    admission_fee: 0,
    tuition_fee: 0,
    books_materials: 0,
    other_fees: 0,
    due_date: ''
  });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (student && isOpen) {
      loadFeeDetails();
    }
  }, [student, isOpen]);

  const loadFeeDetails = async () => {
    if (!student) return;
    
    try {
      const { data, error } = await supabase
        .from('student_fees')
        .select('*')
        .eq('application_id', student.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Parse fee structure from existing data or set defaults
        setFeeStructure({
          admission_fee: data.total_fees * 0.3 || 0, // Example breakdown
          tuition_fee: data.total_fees * 0.6 || 0,
          books_materials: data.total_fees * 0.1 || 0,
          other_fees: 0,
          due_date: data.due_date || ''
        });
      }
    } catch (error) {
      console.error('Error loading fee details:', error);
      toast({
        title: "Error",
        description: "Failed to load fee details.",
        variant: "destructive",
      });
    }
  };

  const calculateTotalFees = () => {
    return feeStructure.admission_fee + feeStructure.tuition_fee + 
           feeStructure.books_materials + feeStructure.other_fees;
  };

  const handleSaveFeeStructure = async () => {
    if (!student) return;

    try {
      setLoading(true);
      const totalFees = calculateTotalFees();
      
      if (totalFees <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Total fees must be greater than 0.",
          variant: "destructive",
        });
        return;
      }

      const feeData = {
        application_id: student.id,
        total_fees: totalFees,
        pending_amount: totalFees - student.paid_amount,
        due_date: feeStructure.due_date || null,
        payment_status: student.paid_amount > 0 ? 'partial' : 'pending'
      };

      const { error } = await supabase
        .from('student_fees')
        .upsert(feeData, { onConflict: 'application_id' });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fee structure saved successfully.",
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error saving fee structure:', error);
      toast({
        title: "Error",
        description: "Failed to save fee structure.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkFullyPaid = async () => {
    if (!student || student.total_fees <= 0) return;

    try {
      setLoading(true);
      const remainingAmount = student.pending_amount;

      // Add payment record
      const { error: paymentError } = await supabase
        .from('fee_payments')
        .insert({
          student_fees_id: student.fee_id,
          payment_amount: remainingAmount,
          payment_method: 'adjustment',
          notes: 'Marked as fully paid by admin'
        });

      if (paymentError) throw paymentError;

      toast({
        title: "Success",
        description: "Student marked as fully paid.",
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error marking as fully paid:', error);
      toast({
        title: "Error",
        description: "Failed to mark as fully paid.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      not_set: { label: 'Not Set', className: 'bg-gray-200 text-gray-800' },
      pending: { label: 'Pending', className: 'bg-red-100 text-red-800' },
      partial: { label: 'Partial', className: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Paid', className: 'bg-green-100 text-green-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_set;
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Fee Management - {student.full_name}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Student Information</span>
                {getStatusBadge(student.payment_status)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium">{student.full_name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Class:</span>
                  <p className="font-medium">{student.class}</p>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <p className="font-medium">{student.contact_number}</p>
                </div>
                <div>
                  <span className="text-gray-600">Applied:</span>
                  <p className="font-medium">
                    {new Date(student.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Fee Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Current Fee Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Fees</p>
                  <p className="text-xl font-bold text-blue-600">
                    {formatCurrency(student.total_fees)}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Paid Amount</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(student.paid_amount)}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Pending Balance</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(student.pending_amount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Setup Form */}
          <Card>
            <CardHeader>
              <CardTitle>Fee Structure Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="admission_fee">Admission Fee</Label>
                  <Input
                    id="admission_fee"
                    type="number"
                    value={feeStructure.admission_fee}
                    onChange={(e) => setFeeStructure(prev => ({
                      ...prev,
                      admission_fee: Number(e.target.value) || 0
                    }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="tuition_fee">Tuition Fee</Label>
                  <Input
                    id="tuition_fee"
                    type="number"
                    value={feeStructure.tuition_fee}
                    onChange={(e) => setFeeStructure(prev => ({
                      ...prev,
                      tuition_fee: Number(e.target.value) || 0
                    }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="books_materials">Books & Materials</Label>
                  <Input
                    id="books_materials"
                    type="number"
                    value={feeStructure.books_materials}
                    onChange={(e) => setFeeStructure(prev => ({
                      ...prev,
                      books_materials: Number(e.target.value) || 0
                    }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="other_fees">Other Fees</Label>
                  <Input
                    id="other_fees"
                    type="number"
                    value={feeStructure.other_fees}
                    onChange={(e) => setFeeStructure(prev => ({
                      ...prev,
                      other_fees: Number(e.target.value) || 0
                    }))}
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={feeStructure.due_date}
                  onChange={(e) => setFeeStructure(prev => ({
                    ...prev,
                    due_date: e.target.value
                  }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-medium">Total Fees:</span>
                <span className="text-xl font-bold text-blue-600">
                  {formatCurrency(calculateTotalFees())}
                </span>
              </div>

              <Button 
                onClick={handleSaveFeeStructure} 
                disabled={loading}
                className="w-full"
              >
                Save Fee Structure
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentForm(true)}
                  className="flex items-center gap-2"
                  disabled={student.total_fees <= 0}
                >
                  <DollarSign className="h-4 w-4" />
                  Add Payment
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleMarkFullyPaid}
                  disabled={loading || student.pending_amount <= 0}
                  className="flex items-center gap-2"
                >
                  <Receipt className="h-4 w-4" />
                  Mark Fully Paid
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                  className="flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  Payment History
                </Button>
                
                <Button
                  variant="outline"
                  disabled
                  className="flex items-center gap-2"
                >
                  <Receipt className="h-4 w-4" />
                  Generate Receipt
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment History Section */}
          {showPaymentHistory && student.fee_id && (
            <PaymentHistory 
              studentFeesId={student.fee_id}
              onUpdate={onUpdate}
            />
          )}
        </div>

        {/* Payment Form Modal */}
        {showPaymentForm && student.fee_id && (
          <PaymentForm
            studentFeesId={student.fee_id}
            studentName={student.full_name}
            pendingAmount={student.pending_amount}
            isOpen={showPaymentForm}
            onClose={() => setShowPaymentForm(false)}
            onSuccess={() => {
              setShowPaymentForm(false);
              onUpdate();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FeeDetailsModal;
