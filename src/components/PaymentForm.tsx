import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle } from 'lucide-react';
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

      const { error } = await supabase
        .from('fee_payments')
        .insert({
          student_fees_id: studentFeesId,
          payment_amount: amount,
          payment_method: payment.method,
          transaction_id: payment.transaction_id || null,
          receipt_number: payment.receipt_number || null,
          notes: payment.notes || null
        });

      if (error) throw error;

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
            <div className="space-y-4">
              <div className="text-center p-6 bg-green-50 rounded-lg">
                <div className="text-green-600 text-4xl mb-2">✅</div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Payment Recorded Successfully
                </h3>
                <p className="text-green-700">
                  ₹{lastPaymentData?.amount.toLocaleString()} has been added to {studentName}'s account
                </p>
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
