import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Receipt, History } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Payment {
  id: string;
  payment_amount: number;
  payment_date: string;
  payment_method: string;
  transaction_id: string | null;
  submitted_utr: string | null;
  verification_status: 'pending_verification' | 'verified' | 'rejected';
  verified_at: string | null;
  verification_notes: string | null;
  receipt_number: string | null;
  notes: string | null;
  created_at: string;
}

interface PaymentHistoryProps {
  studentFeesId: string;
  studentData: {
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
  };
  onUpdate: () => void;
}

const PaymentHistory = ({ studentFeesId, onUpdate }: PaymentHistoryProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (studentFeesId) {
      fetchPayments();
    }
  }, [studentFeesId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('fee_payments')
        .select('*')
        .eq('student_fees_id', studentFeesId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPayments((data || []) as Payment[]);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment history.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const recalculateStudentFeeSummary = async () => {
    const { data: feeRow, error: feeError } = await supabase
      .from('student_fees')
      .select('id, total_fees')
      .eq('id', studentFeesId)
      .single();

    if (feeError || !feeRow) {
      throw feeError || new Error('Failed to read student fee data');
    }

    const { data: verifiedPayments, error: verifiedError } = await (supabase
      .from('fee_payments') as any)
      .select('payment_amount')
      .eq('student_fees_id', studentFeesId)
      .eq('verification_status', 'verified');

    if (verifiedError) {
      throw verifiedError;
    }

    const totalFees = Number(feeRow.total_fees || 0);
    const verifiedPaid = (verifiedPayments || []).reduce((sum: number, p: any) => sum + Number(p.payment_amount || 0), 0);
    const paidAmount = Math.min(totalFees, Math.max(0, verifiedPaid));
    const pendingAmount = Math.max(0, totalFees - paidAmount);
    const paymentStatus = totalFees <= 0
      ? 'not_set'
      : paidAmount >= totalFees
        ? 'paid'
        : paidAmount > 0
          ? 'partial'
          : 'pending';

    const { error: updateError } = await supabase
      .from('student_fees')
      .update({
        paid_amount: paidAmount,
        pending_amount: pendingAmount,
        payment_status: paymentStatus,
        paid_date: paymentStatus === 'paid' ? new Date().toISOString().split('T')[0] : null,
      })
      .eq('id', studentFeesId);

    if (updateError) {
      throw updateError;
    }
  };

  const handleVerifyPayment = async (paymentId: string, status: 'verified' | 'rejected') => {
    try {
      const { data: authData } = await supabase.auth.getSession();
      const verifierId = authData?.session?.user?.id || null;

      const { error } = await (supabase.from('fee_payments') as any)
        .update({
          verification_status: status,
          verified_at: new Date().toISOString(),
          verified_by: verifierId,
          verification_notes: status === 'verified'
            ? 'Verified by admin after manual check'
            : 'Rejected by admin after manual check',
        })
        .eq('id', paymentId);

      if (error) {
        throw error;
      }

      await recalculateStudentFeeSummary();

      toast({
        title: status === 'verified' ? 'Payment Approved' : 'Payment Rejected',
        description: status === 'verified'
          ? 'Marked as paid and included in fee summary.'
          : 'Marked as not paid and excluded from fee summary.',
      });

      await fetchPayments();
      onUpdate();
    } catch (error) {
      console.error('Error updating payment verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to update payment verification status.',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from('fee_payments')
        .delete()
        .eq('id', paymentId);

      if (error) {
        throw error;
      }

      await recalculateStudentFeeSummary();

      toast({
        title: "Success",
        description: "Payment deleted successfully.",
      });

      await fetchPayments();
      onUpdate();
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast({
        title: "Error",
        description: "Failed to delete payment.",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      cash: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
      bank_transfer: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      upi: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
      card: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
      cheque: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
      adjustment: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    };

    return (
      <Badge className={colors[method as keyof typeof colors] || colors.other}>
        {method.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getVerificationBadge = (status: Payment['verification_status']) => {
    if (status === 'verified') {
      return <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">Verified</Badge>;
    }
    if (status === 'rejected') {
      return <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">Rejected</Badge>;
    }
    return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">Pending Verification</Badge>;
  };

  if (loading) {
    return (
      <Card className="bg-white dark:bg-[#0B1121] border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <History className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">Loading payment history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-[#0B1121] border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <History className="h-5 w-5" />
          Recent Payments
        </CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">No payments recorded yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Payment history will appear here once payments are added</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="p-4 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">{formatDate(payment.payment_date)}</div>
                    {getMethodBadge(payment.payment_method)}
                    {getVerificationBadge(payment.verification_status)}
                  </div>
                  <div className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(payment.payment_amount)}
                  </div>
                </div>

                {(payment.submitted_utr || payment.transaction_id) && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    UTR: {payment.submitted_utr || payment.transaction_id}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {payment.verification_status === 'pending_verification' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20"
                        onClick={() => handleVerifyPayment(payment.id, 'verified')}
                      >
                        Mark Paid
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-900/20"
                        onClick={() => handleVerifyPayment(payment.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] sm:max-w-lg rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this payment of {formatCurrency(payment.payment_amount)}?
                          This action cannot be undone and will update the student's payment status.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeletePayment(payment.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistory;
