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

const PaymentHistory = ({ studentFeesId, studentData, onUpdate }: PaymentHistoryProps) => {
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

      setPayments(data || []);
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

  const handleDeletePayment = async (paymentId: string, paymentAmount: number) => {
    try {
      const { error } = await supabase
        .from('fee_payments')
        .delete()
        .eq('id', paymentId);

      if (error) {
        throw error;
      }

      // Update student_fees to reflect the deleted payment
      const { data: currentFees, error: fetchError } = await supabase
        .from('student_fees')
        .select('total_fees, paid_amount')
        .eq('id', studentFeesId)
        .single();

      if (!fetchError && currentFees) {
        const totalFees = Number(currentFees.total_fees || 0);
        const currentPaid = Number(currentFees.paid_amount || 0);
        const newPaidAmount = Math.min(totalFees, Math.max(0, currentPaid - paymentAmount));
        const newPendingAmount = Math.max(0, totalFees - newPaidAmount);
        const newStatus = totalFees <= 0
          ? 'not_set'
          : newPaidAmount >= totalFees
            ? 'paid'
            : newPaidAmount > 0
              ? 'partial'
              : 'pending';

        await supabase
          .from('student_fees')
          .update({
            paid_amount: newPaidAmount,
            pending_amount: newPendingAmount,
            payment_status: newStatus
          })
          .eq('id', studentFeesId);
      }

      toast({
        title: "Success",
        description: "Payment deleted successfully.",
      });

      fetchPayments();
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
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
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
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };

    return (
      <Badge className={colors[method as keyof typeof colors] || colors.other}>
        {method.replace('_', ' ').toUpperCase()}
      </Badge>
    );
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
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(payment.payment_date)}
                  </div>
                  {getMethodBadge(payment.payment_method)}
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(payment.payment_amount)}
                  </span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
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
                          onClick={() => handleDeletePayment(payment.id, payment.payment_amount)}
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
