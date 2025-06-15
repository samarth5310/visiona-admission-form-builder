import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, DollarSign, Receipt, History, X, Trash2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import PaymentForm from './PaymentForm';
import PaymentHistory from './PaymentHistory';
import ReceiptGenerator from './ReceiptGenerator';

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
    // Academic Fees
    admission_fee: 0,
    tuition_fee: 0,
    administrative_fee: 0,
    exam_fee: 0,
    registration_fee: 0,
    // Additional Fees
    books_materials: 0,
    lab_fee: 0,
    sports_fee: 0,
    library_fee: 0,
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
        // For existing records, distribute total fees across different categories
        const totalFees = data.total_fees || 0;
        setFeeStructure({
          admission_fee: Math.round(totalFees * 0.2) || 0,
          tuition_fee: Math.round(totalFees * 0.4) || 0,
          administrative_fee: Math.round(totalFees * 0.1) || 0,
          exam_fee: Math.round(totalFees * 0.05) || 0,
          registration_fee: Math.round(totalFees * 0.05) || 0,
          books_materials: Math.round(totalFees * 0.1) || 0,
          lab_fee: Math.round(totalFees * 0.05) || 0,
          sports_fee: Math.round(totalFees * 0.02) || 0,
          library_fee: Math.round(totalFees * 0.02) || 0,
          other_fees: Math.round(totalFees * 0.01) || 0,
          due_date: data.due_date || ''
        });
      } else {
        // Reset to default values for new records
        setFeeStructure({
          admission_fee: 0,
          tuition_fee: 0,
          administrative_fee: 0,
          exam_fee: 0,
          registration_fee: 0,
          books_materials: 0,
          lab_fee: 0,
          sports_fee: 0,
          library_fee: 0,
          other_fees: 0,
          due_date: ''
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

  const calculateAcademicSubtotal = () => {
    return feeStructure.admission_fee + feeStructure.tuition_fee + 
           feeStructure.administrative_fee + feeStructure.exam_fee + 
           feeStructure.registration_fee;
  };

  const calculateAdditionalSubtotal = () => {
    return feeStructure.books_materials + feeStructure.lab_fee + 
           feeStructure.sports_fee + feeStructure.library_fee + 
           feeStructure.other_fees;
  };

  const calculateGrandTotal = () => {
    return calculateAcademicSubtotal() + calculateAdditionalSubtotal();
  };

  const handleSaveFeeStructure = async () => {
    if (!student) return;

    try {
      setLoading(true);
      const grandTotal = calculateGrandTotal();
      
      if (grandTotal <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Total fees must be greater than 0.",
          variant: "destructive",
        });
        return;
      }

      console.log('Saving fee structure for student:', student.id);
      console.log('Grand total:', grandTotal);
      console.log('Current paid amount:', student.paid_amount);

      // Calculate correct pending amount
      const pendingAmount = grandTotal - (student.paid_amount || 0);

      const feeData = {
        application_id: student.id,
        total_fees: grandTotal,
        paid_amount: student.paid_amount || 0, // Keep existing paid amount
        pending_amount: pendingAmount,
        due_date: feeStructure.due_date || null,
        payment_status: (student.paid_amount || 0) > 0 ? 
          ((student.paid_amount || 0) >= grandTotal ? 'paid' : 'partial') : 
          'pending'
      };

      console.log('Fee data to save:', feeData);

      const { data, error } = await supabase
        .from('student_fees')
        .upsert(feeData, { 
          onConflict: 'application_id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fee structure saved successfully:', data);

      toast({
        title: "Success",
        description: "Fee structure saved successfully.",
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error saving fee structure:', error);
      toast({
        title: "Error",
        description: "Failed to save fee structure. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFeeStructure = async () => {
    if (!student || !student.fee_id) {
      toast({
        title: "Error",
        description: "No fee structure found to delete.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // First delete all related payments
      const { error: paymentsError } = await supabase
        .from('fee_payments')
        .delete()
        .eq('student_fees_id', student.fee_id);

      if (paymentsError) throw paymentsError;

      // Then delete the fee structure
      const { error: feeError } = await supabase
        .from('student_fees')
        .delete()
        .eq('id', student.fee_id);

      if (feeError) throw feeError;

      toast({
        title: "Success",
        description: "Fee structure and all payments deleted successfully.",
      });
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error deleting fee structure:', error);
      toast({
        title: "Error",
        description: "Failed to delete fee structure. Please try again.",
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
      <DialogContent className="max-w-[95vw] sm:max-w-6xl max-h-[95vh] overflow-y-auto p-3 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Fee Management - {student.full_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Student Information Section */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm sm:text-base">
                <span>Student Information</span>
                {getStatusBadge(student.payment_status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-medium break-words">{student.full_name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Class:</span>
                  <p className="font-medium">{student.class}</p>
                </div>
                <div>
                  <span className="text-gray-600">Phone:</span>
                  <p className="font-medium break-all">{student.contact_number}</p>
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
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                Current Fee Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600">Total Fees</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-600">
                    {formatCurrency(student.total_fees)}
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-green-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600">Paid Amount</p>
                  <p className="text-lg sm:text-xl font-bold text-green-600">
                    {formatCurrency(student.paid_amount)}
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-red-50 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-600">Pending Balance</p>
                  <p className="text-lg sm:text-xl font-bold text-red-600">
                    {formatCurrency(Math.max(0, student.total_fees - student.paid_amount))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Setup Form - Mobile Responsive Layout */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm sm:text-base">
                <span>Fee Structure Setup</span>
                {student.fee_id && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteFeeStructure}
                    disabled={loading}
                    className="flex items-center gap-2 text-xs"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    Delete Structure
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                {/* Academic Fees */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-sm sm:text-lg font-semibold text-blue-600 border-b pb-2">Academic Fees</h3>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <Label htmlFor="admission_fee" className="text-xs sm:text-sm">Admission Fee</Label>
                      <Input
                        id="admission_fee"
                        type="number"
                        value={feeStructure.admission_fee}
                        onChange={(e) => setFeeStructure(prev => ({
                          ...prev,
                          admission_fee: Number(e.target.value) || 0
                        }))}
                        placeholder="0"
                        className="text-xs sm:text-sm"
                        size="sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="tuition_fee" className="text-xs sm:text-sm">Tuition Fee</Label>
                      <Input
                        id="tuition_fee"
                        type="number"
                        value={feeStructure.tuition_fee}
                        onChange={(e) => setFeeStructure(prev => ({
                          ...prev,
                          tuition_fee: Number(e.target.value) || 0
                        }))}
                        placeholder="0"
                        className="text-xs sm:text-sm"
                        size="sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="administrative_fee" className="text-xs sm:text-sm">Administrative Fee</Label>
                      <Input
                        id="administrative_fee"
                        type="number"
                        value={feeStructure.administrative_fee}
                        onChange={(e) => setFeeStructure(prev => ({
                          ...prev,
                          administrative_fee: Number(e.target.value) || 0
                        }))}
                        placeholder="0"
                        className="text-xs sm:text-sm"
                        size="sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="exam_fee" className="text-xs sm:text-sm">Exam Fee</Label>
                      <Input
                        id="exam_fee"
                        type="number"
                        value={feeStructure.exam_fee}
                        onChange={(e) => setFeeStructure(prev => ({
                          ...prev,
                          exam_fee: Number(e.target.value) || 0
                        }))}
                        placeholder="0"
                        className="text-xs sm:text-sm"
                        size="sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="registration_fee" className="text-xs sm:text-sm">Registration Fee</Label>
                      <Input
                        id="registration_fee"
                        type="number"
                        value={feeStructure.registration_fee}
                        onChange={(e) => setFeeStructure(prev => ({
                          ...prev,
                          registration_fee: Number(e.target.value) || 0
                        }))}
                        placeholder="0"
                        className="text-xs sm:text-sm"
                        size="sm"
                      />
                    </div>
                  </div>

                  <div className="p-2 sm:p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-xs sm:text-sm">Academic Subtotal:</span>
                      <span className="text-sm sm:text-lg font-bold text-blue-600">
                        {formatCurrency(calculateAcademicSubtotal())}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Fees */}
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-sm sm:text-lg font-semibold text-green-600 border-b pb-2">Additional Fees</h3>
                  
                  <div className="space-y-2 sm:space-y-3">
                    <div>
                      <Label htmlFor="books_materials" className="text-xs sm:text-sm">Books & Materials</Label>
                      <Input
                        id="books_materials"
                        type="number"
                        value={feeStructure.books_materials}
                        onChange={(e) => setFeeStructure(prev => ({
                          ...prev,
                          books_materials: Number(e.target.value) || 0
                        }))}
                        placeholder="0"
                        className="text-xs sm:text-sm"
                        size="sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="lab_fee" className="text-xs sm:text-sm">Lab Fee</Label>
                      <Input
                        id="lab_fee"
                        type="number"
                        value={feeStructure.lab_fee}
                        onChange={(e) => setFeeStructure(prev => ({
                          ...prev,
                          lab_fee: Number(e.target.value) || 0
                        }))}
                        placeholder="0"
                        className="text-xs sm:text-sm"
                        size="sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="sports_fee" className="text-xs sm:text-sm">Sports Fee</Label>
                      <Input
                        id="sports_fee"
                        type="number"
                        value={feeStructure.sports_fee}
                        onChange={(e) => setFeeStructure(prev => ({
                          ...prev,
                          sports_fee: Number(e.target.value) || 0
                        }))}
                        placeholder="0"
                        className="text-xs sm:text-sm"
                        size="sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="library_fee" className="text-xs sm:text-sm">Library Fee</Label>
                      <Input
                        id="library_fee"
                        type="number"
                        value={feeStructure.library_fee}
                        onChange={(e) => setFeeStructure(prev => ({
                          ...prev,
                          library_fee: Number(e.target.value) || 0
                        }))}
                        placeholder="0"
                        className="text-xs sm:text-sm"
                        size="sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="other_fees" className="text-xs sm:text-sm">Other Fees</Label>
                      <Input
                        id="other_fees"
                        type="number"
                        value={feeStructure.other_fees}
                        onChange={(e) => setFeeStructure(prev => ({
                          ...prev,
                          other_fees: Number(e.target.value) || 0
                        }))}
                        placeholder="0"
                        className="text-xs sm:text-sm"
                        size="sm"
                      />
                    </div>
                  </div>

                  <div className="p-2 sm:p-3 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-xs sm:text-sm">Additional Subtotal:</span>
                      <span className="text-sm sm:text-lg font-bold text-green-600">
                        {formatCurrency(calculateAdditionalSubtotal())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="due_date" className="text-xs sm:text-sm">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={feeStructure.due_date}
                    onChange={(e) => setFeeStructure(prev => ({
                      ...prev,
                      due_date: e.target.value
                    }))}
                    className="text-xs sm:text-sm"
                    size="sm"
                  />
                </div>

                <div className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300">
                  <span className="text-sm sm:text-xl font-bold">Grand Total:</span>
                  <span className="text-lg sm:text-2xl font-bold text-purple-600">
                    {formatCurrency(calculateGrandTotal())}
                  </span>
                </div>

                <Button 
                  onClick={handleSaveFeeStructure} 
                  disabled={loading}
                  className="w-full text-sm sm:text-lg py-4 sm:py-6"
                  size="lg"
                >
                  {loading ? 'Saving...' : 'Save Fee Structure'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-sm sm:text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentForm(true)}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3"
                  disabled={student.total_fees <= 0}
                  size="sm"
                >
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                  Add Payment
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleMarkFullyPaid}
                  disabled={loading || student.pending_amount <= 0}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3"
                  size="sm"
                >
                  <Receipt className="h-3 w-3 sm:h-4 sm:w-4" />
                  Mark Paid
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm p-2 sm:p-3"
                  size="sm"
                >
                  <History className="h-3 w-3 sm:h-4 sm:w-4" />
                  History
                </Button>
                
                <ReceiptGenerator 
                  student={student}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment History Section */}
          {showPaymentHistory && student.fee_id && (
            <PaymentHistory 
              studentFeesId={student.fee_id}
              studentData={student}
              onUpdate={onUpdate}
            />
          )}
        </div>

        {/* Payment Form Modal */}
        {showPaymentForm && student.fee_id && (
          <PaymentForm
            studentFeesId={student.fee_id}
            studentName={student.full_name}
            pendingAmount={Math.max(0, student.total_fees - student.paid_amount)}
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
