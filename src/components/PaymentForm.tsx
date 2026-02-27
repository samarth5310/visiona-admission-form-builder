import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import WhatsAppMessaging from './WhatsAppMessaging';

interface PaymentFormProps {
  studentFeesId: string;
  studentName: string;
  pendingAmount: number;
  phoneNumber?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentForm = ({
  studentFeesId,
  studentName,
  pendingAmount,
  phoneNumber = '',
  isOpen,
  onClose,
  onSuccess
}: PaymentFormProps) => {
  const [payment, setPayment] = useState({
    amount: '',
    method: 'cash',
    transaction_id: '',
    receipt_number: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [lastPaymentData, setLastPaymentData] = useState<{
    amount: number;
    date: string;
    method: string;
  } | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = Number(payment.amount);
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Payment amount must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    if (amount > pendingAmount) {
      toast({
        title: "Invalid Amount",
        description: `Payment amount cannot exceed pending balance of ₹${pendingAmount.toLocaleString()}.`,
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Insert the payment record
      const { error: paymentError } = await supabase
        .from('fee_payments')
        .insert({
          student_fees_id: studentFeesId,
          payment_amount: amount,
          payment_method: payment.method,
          transaction_id: payment.transaction_id || null,
          receipt_number: payment.receipt_number || null,
          notes: payment.notes || null
        });

      if (paymentError) throw paymentError;

      // Calculate new paid amount and update student_fees
      const { data: currentFees, error: fetchError } = await supabase
        .from('student_fees')
        .select('total_fees, paid_amount')
        .eq('id', studentFeesId)
        .single();

      if (fetchError) throw fetchError;

      const newPaidAmount = (currentFees?.paid_amount || 0) + amount;
      const totalFees = currentFees?.total_fees || 0;
      const newPendingAmount = Math.max(0, totalFees - newPaidAmount);
      const newStatus = newPaidAmount >= totalFees ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'pending');

      const { error: updateError } = await supabase
        .from('student_fees')
        .update({
          paid_amount: newPaidAmount,
          pending_amount: newPendingAmount,
          payment_status: newStatus,
          paid_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', studentFeesId);

      if (updateError) throw updateError;

      // Store payment data for WhatsApp message
      setLastPaymentData({
        amount,
        date: new Date().toISOString().split('T')[0],
        method: payment.method
      });

      setPaymentSuccess(true);

      toast({
        title: "Success",
        description: `Payment of ₹${amount.toLocaleString()} added successfully.`,
      });

      onSuccess();
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: "Error",
        description: "Failed to add payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPaymentSuccess(false);
    setLastPaymentData(null);
    setPayment({
      amount: '',
      method: 'cash',
      transaction_id: '',
      receipt_number: '',
      notes: ''
    });
    onClose();
  };

  const handleWhatsAppSuccess = () => {
    setShowWhatsApp(false);
    handleClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentType = (method: string) => {
    const typeMap: { [key: string]: string } = {
      'cash': 'ನಗದು ಪಾವತಿ',
      'bank_transfer': 'ಬ್ಯಾಂಕ್ ವರ್ಗಾವಣೆ',
      'upi': 'UPI ಪಾವತಿ',
      'card': 'ಕಾರ್ಡ್ ಪಾವತಿ',
      'cheque': 'ಚೆಕ್ ಪಾವತಿ',
      'other': 'ಇತರ ಪಾವತಿ'
    };
    return typeMap[method] || method;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {paymentSuccess ? 'Payment Successful!' : `Add Payment - ${studentName}`}
            </DialogTitle>
            <DialogDescription className="sr-only">
              {paymentSuccess ? 'Payment confirmation details' : 'Form to record a new payment'}
            </DialogDescription>
          </DialogHeader>

          {paymentSuccess ? (
            <div className="space-y-6">
              <div className="text-center p-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl border border-emerald-100 dark:border-emerald-800/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                    Payment Success!
                  </h3>
                  <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-2">
                    {formatCurrency(lastPaymentData?.amount || 0)}
                  </p>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Successfully credited to <span className="text-gray-900 dark:text-white">{studentName}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Close
                </Button>
                {phoneNumber && (
                  <Button
                    onClick={() => setShowWhatsApp(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Send WhatsApp
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-gray-600">Pending Balance</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(pendingAmount)}
                </p>
              </div>

              <div>
                <Label htmlFor="amount">Payment Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={pendingAmount}
                  value={payment.amount}
                  onChange={(e) => setPayment(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Enter amount"
                  required
                />
              </div>

              <div>
                <Label htmlFor="method">Payment Method *</Label>
                <Select
                  value={payment.method}
                  onValueChange={(value) => setPayment(prev => ({ ...prev, method: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="transaction_id">Transaction ID</Label>
                <Input
                  id="transaction_id"
                  value={payment.transaction_id}
                  onChange={(e) => setPayment(prev => ({ ...prev, transaction_id: e.target.value }))}
                  placeholder="Enter transaction ID (optional)"
                />
              </div>

              <div>
                <Label htmlFor="receipt_number">Receipt Number</Label>
                <Input
                  id="receipt_number"
                  value={payment.receipt_number}
                  onChange={(e) => setPayment(prev => ({ ...prev, receipt_number: e.target.value }))}
                  placeholder="Enter receipt number (optional)"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={payment.notes}
                  onChange={(e) => setPayment(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes (optional)"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Adding...' : 'Add Payment'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {showWhatsApp && lastPaymentData && (
        <WhatsAppMessaging
          studentName={studentName}
          amountPaid={lastPaymentData.amount}
          paymentDate={lastPaymentData.date}
          paymentType={getPaymentType(lastPaymentData.method)}
          dueAmount={Math.max(0, pendingAmount - lastPaymentData.amount)}
          phoneNumber={phoneNumber}
          isOpen={showWhatsApp}
          onClose={handleWhatsAppSuccess}
        />
      )}
    </>
  );
};

export default PaymentForm;
