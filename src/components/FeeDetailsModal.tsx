import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, DollarSign, Receipt, History, X, Trash2, Plus } from 'lucide-react';
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
  paid_date: string | null;
  fee_id?: string;
  admission_number?: string;
}

interface FeeDetailsModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

interface FeeItem {
  name: string;
  amount: number;
}

const FeeDetailsModal = ({ student, isOpen, onClose, onUpdate }: FeeDetailsModalProps) => {
  const [feeBreakdown, setFeeBreakdown] = useState<FeeItem[]>([]);
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

      if (data?.fee_breakdown) {
        setFeeBreakdown(data.fee_breakdown as unknown as FeeItem[]);
      } else if (data?.total_fees) {
        setFeeBreakdown([{ name: 'Total Fees', amount: data.total_fees }]);
      } else {
        setFeeBreakdown([{ name: 'Admission Fee', amount: 0 }]);
      }
    } catch (error) {
      console.error('Error loading fee details:', error);
    }
  };

  const addFeeItem = () => {
    setFeeBreakdown([...feeBreakdown, { name: '', amount: 0 }]);
  };

  const removeFeeItem = (index: number) => {
    setFeeBreakdown(feeBreakdown.filter((_, i) => i !== index));
  };

  const updateFeeItem = (index: number, field: keyof FeeItem, value: string | number) => {
    const newBreakdown = [...feeBreakdown];
    newBreakdown[index] = { ...newBreakdown[index], [field]: value };
    setFeeBreakdown(newBreakdown);
  };

  const calculateGrandTotal = () => {
    return feeBreakdown.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  };

  const handleSaveFeeStructure = async () => {
    if (!student) return;

    try {
      setLoading(true);
      const grandTotal = calculateGrandTotal();

      const { error } = await supabase
        .from('student_fees')
        .upsert({
          application_id: student.id,
          total_fees: grandTotal,
          fee_breakdown: feeBreakdown as any,
          paid_amount: student.paid_amount || 0,
          pending_amount: grandTotal - (student.paid_amount || 0),
          payment_status: (student.paid_amount || 0) > 0 ?
            ((student.paid_amount || 0) >= grandTotal ? 'paid' : 'partial') :
            'pending'
        }, { onConflict: 'application_id' });

      if (error) throw error;

      toast({ title: "Success", description: "Fee structure updated." });
      onUpdate();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkFullyPaid = async () => {
    if (!student || student.total_fees <= 0) return;

    try {
      setLoading(true);
      const remainingAmount = Math.max(0, student.total_fees - student.paid_amount);

      if (remainingAmount <= 0) {
        toast({
          title: "Already Paid",
          description: "This student has already paid the full amount.",
        });
        return;
      }

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

      // Update student_fees to reflect fully paid status
      const { error: updateError } = await supabase
        .from('student_fees')
        .update({
          paid_amount: student.total_fees,
          pending_amount: 0,
          payment_status: 'paid',
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', student.fee_id);

      if (updateError) throw updateError;

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
      <DialogContent className="max-w-6xl w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col p-0 sm:p-6 rounded-none sm:rounded-2xl border-none sm:border overflow-hidden bg-white dark:bg-[#0B1121] [&>button]:top-[calc(env(safe-area-inset-top)+1rem)] sm:[&>button]:top-4">
        <DialogHeader className="px-6 pt-[calc(env(safe-area-inset-top)+1.5rem)] sm:p-0">
          <DialogTitle>Fee Management - {student.full_name}</DialogTitle>
          <DialogDescription className="sr-only">
            Manage fees and view payment history for {student.full_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 overflow-y-auto p-4 sm:p-0 flex-1 scrollbar-hide">
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
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
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
                    {formatCurrency(Math.max(0, student.total_fees - student.paid_amount))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fee Setup Form - Granular Breakdown */}
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-gray-800/50">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                    <Plus className="h-4 w-4" />
                  </div>
                  Fee Breakdown
                </div>
                <Button variant="outline" size="sm" onClick={addFeeItem} className="gap-2">
                  <Plus className="h-4 w-4" /> Add Item
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {feeBreakdown.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-3 items-end sm:items-center bg-gray-50/50 dark:bg-gray-800/20 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="flex-1 w-full space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-gray-400">Description</Label>
                    <Input
                      placeholder="e.g. Tuition Fee"
                      value={item.name}
                      onChange={e => updateFeeItem(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="w-full sm:w-40 space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-gray-400">Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                      <Input
                        type="number"
                        className="pl-7"
                        value={item.amount}
                        onChange={e => updateFeeItem(index, 'amount', Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeFeeItem(index)} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 grow-0 shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <div className="mt-6 p-5 sm:p-7 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-emerald-950 dark:via-[#0B1121] dark:to-teal-950 text-white rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-6 border border-white/5">
                <div className="text-center sm:text-left">
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Aggregate Total</p>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{formatCurrency(calculateGrandTotal())}</h2>
                </div>
                <Button
                  onClick={handleSaveFeeStructure}
                  disabled={loading}
                  className="w-full sm:w-auto px-10 h-14 bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl shadow-[0_8px_30px_-4px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                >
                  {loading ? 'Processing...' : 'Sync Structure'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3">
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

                <ReceiptGenerator
                  student={student}
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment History Section */}
          {
            showPaymentHistory && student.fee_id && (
              <PaymentHistory
                studentFeesId={student.fee_id}
                studentData={student}
                onUpdate={onUpdate}
              />
            )
          }
        </div>

        {/* Payment Form Modal */}
        {
          showPaymentForm && student.fee_id && (
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
          )
        }
      </DialogContent>
    </Dialog>
  );
};

export default FeeDetailsModal;
