
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  full_name: string;
  class: string;
  contact_number: string;
  email: string;
}

interface Payment {
  id: string;
  payment_amount: number;
  payment_date: string;
  payment_method: string;
  transaction_id: string | null;
  receipt_number: string | null;
  notes: string | null;
}

interface StudentFeeDetailsProps {
  student: Student;
  onFeeUpdate: () => void;
}

const StudentFeeDetails = ({ student, onFeeUpdate }: StudentFeeDetailsProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showAddFee, setShowAddFee] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [selectedFeeId, setSelectedFeeId] = useState<string>('');
  const { toast } = useToast();

  // Form states
  const [feeForm, setFeeForm] = useState({
    total_fees: '',
    fee_category: 'tuition',
    due_date: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    payment_amount: '',
    payment_method: 'cash',
    transaction_id: '',
    receipt_number: '',
    notes: ''
  });

  useEffect(() => {
    if (selectedFeeId) {
      fetchPayments(selectedFeeId);
    }
  }, [selectedFeeId]);

  const fetchPayments = async (feeId: string) => {
    try {
      const { data, error } = await supabase
        .from('fee_payments')
        .select('*')
        .eq('student_fees_id', feeId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleAddFee = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('student_fees')
        .insert({
          application_id: student.id,
          total_fees: parseFloat(feeForm.total_fees),
          pending_amount: parseFloat(feeForm.total_fees),
          fee_category: feeForm.fee_category,
          due_date: feeForm.due_date || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Fee record added successfully",
      });

      setFeeForm({ total_fees: '', fee_category: 'tuition', due_date: '' });
      setShowAddFee(false);
      onFeeUpdate();
    } catch (error) {
      console.error('Error adding fee:', error);
      toast({
        title: "Error",
        description: "Failed to add fee record",
        variant: "destructive",
      });
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFeeId) {
      toast({
        title: "Error",
        description: "Please select a fee record first",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('fee_payments')
        .insert({
          student_fees_id: selectedFeeId,
          payment_amount: parseFloat(paymentForm.payment_amount),
          payment_method: paymentForm.payment_method,
          transaction_id: paymentForm.transaction_id || null,
          receipt_number: paymentForm.receipt_number || null,
          notes: paymentForm.notes || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });

      setPaymentForm({
        payment_amount: '',
        payment_method: 'cash',
        transaction_id: '',
        receipt_number: '',
        notes: ''
      });
      setShowAddPayment(false);
      onFeeUpdate();
      fetchPayments(selectedFeeId);
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Add Fee Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Fee Management Actions
            <div className="space-x-2">
              <Button 
                onClick={() => setShowAddFee(!showAddFee)}
                variant="outline"
                size="sm"
              >
                {showAddFee ? 'Cancel' : 'Add Fee Record'}
              </Button>
              <Button 
                onClick={() => setShowAddPayment(!showAddPayment)}
                variant="outline"
                size="sm"
              >
                {showAddPayment ? 'Cancel' : 'Record Payment'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Fee Form */}
          {showAddFee && (
            <form onSubmit={handleAddFee} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
              <div>
                <Label htmlFor="total_fees">Total Fees (₹)</Label>
                <Input
                  id="total_fees"
                  type="number"
                  value={feeForm.total_fees}
                  onChange={(e) => setFeeForm({ ...feeForm, total_fees: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="fee_category">Category</Label>
                <Select value={feeForm.fee_category} onValueChange={(value) => setFeeForm({ ...feeForm, fee_category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tuition">Tuition</SelectItem>
                    <SelectItem value="admission">Admission</SelectItem>
                    <SelectItem value="books">Books</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="hostel">Hostel</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={feeForm.due_date}
                  onChange={(e) => setFeeForm({ ...feeForm, due_date: e.target.value })}
                />
              </div>
              <div className="md:col-span-3">
                <Button type="submit" className="w-full">Add Fee Record</Button>
              </div>
            </form>
          )}

          {/* Add Payment Form */}
          {showAddPayment && (
            <form onSubmit={handleAddPayment} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
              <div>
                <Label htmlFor="payment_amount">Payment Amount (₹)</Label>
                <Input
                  id="payment_amount"
                  type="number"
                  step="0.01"
                  value={paymentForm.payment_amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_amount: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select value={paymentForm.payment_method} onValueChange={(value) => setPaymentForm({ ...paymentForm, payment_method: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="online">Online Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                    <SelectItem value="dd">Demand Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="transaction_id">Transaction ID</Label>
                <Input
                  id="transaction_id"
                  value={paymentForm.transaction_id}
                  onChange={(e) => setPaymentForm({ ...paymentForm, transaction_id: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="receipt_number">Receipt Number</Label>
                <Input
                  id="receipt_number"
                  value={paymentForm.receipt_number}
                  onChange={(e) => setPaymentForm({ ...paymentForm, receipt_number: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Any additional notes..."
                />
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="w-full">Record Payment</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                    <TableCell>₹{payment.payment_amount}</TableCell>
                    <TableCell className="capitalize">{payment.payment_method}</TableCell>
                    <TableCell>{payment.transaction_id || '-'}</TableCell>
                    <TableCell>{payment.receipt_number || '-'}</TableCell>
                    <TableCell>{payment.notes || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentFeeDetails;
