import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, IndianRupee, Calendar, Receipt, DollarSign, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface FeeDetails {
  id: string;
  total_fees: number;
  paid_amount: number;
  pending_amount: number;
  payment_status: string;
  fee_category: string;
  paid_date: string | null;
}

interface PaymentHistory {
  id: string;
  payment_amount: number;
  payment_date: string;
  payment_method: string;
  receipt_number: string | null;
  notes: string | null;
}

const StudentFeeDetails = () => {
  const [feeDetails, setFeeDetails] = useState<FeeDetails | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeeDetails();

    // Set up real-time subscriptions
    const feeChannel = supabase
      .channel('student-fees-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_fees'
        },
        () => {
          fetchFeeDetails();
        }
      )
      .subscribe();

    const paymentChannel = supabase
      .channel('fee-payments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fee_payments'
        },
        () => {
          fetchFeeDetails();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(feeChannel);
      supabase.removeChannel(paymentChannel);
    };
  }, []);

  const fetchFeeDetails = async () => {
    try {
      const studentData = localStorage.getItem('visiona_student_data');
      if (!studentData) return;

      const student = JSON.parse(studentData);

      // Fetch fee details
      const { data: feeData, error: feeError } = await supabase
        .from('student_fees')
        .select('*')
        .eq('application_id', student.id)
        .maybeSingle();

      if (feeError) {
        throw feeError;
      }

      if (feeData) {
        const correctedPendingAmount = Math.max(0, feeData.total_fees - feeData.paid_amount);

        const correctedFeeData = {
          ...feeData,
          pending_amount: correctedPendingAmount,
          paid_amount: Math.min(feeData.paid_amount, feeData.total_fees)
        };

        setFeeDetails(correctedFeeData);

        // Fetch payment history if fee details exist
        const { data: paymentData, error: paymentError } = await supabase
          .from('fee_payments')
          .select('*')
          .eq('student_fees_id', feeData.id)
          .order('payment_date', { ascending: false });

        if (paymentError) throw paymentError;
        setPaymentHistory(paymentData || []);
      } else {
        setFeeDetails(null);
      }
    } catch (error) {
      console.error('Error fetching fee details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'partial':
        return 'bg-yellow-500';
      case 'pending':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'partial':
        return 'Partially Paid';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const getDisplayValues = (feeDetails: FeeDetails) => {
    const totalFees = feeDetails.total_fees;
    const paidAmount = Math.min(feeDetails.paid_amount, totalFees);
    const pendingAmount = Math.max(0, totalFees - paidAmount);

    return {
      totalFees,
      paidAmount,
      pendingAmount,
      completionPercentage: totalFees > 0 ? (paidAmount / totalFees) * 100 : 0
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!feeDetails) {
    return (
      <Card className="border-dashed border-2 bg-gray-50 dark:bg-white/5 dark:border-white/10">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
            <CreditCard className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Fee Details</h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mt-2">
            Fee information will appear here once set up by the admin.
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayValues = getDisplayValues(feeDetails);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Status</h2>
          <p className="text-gray-500 dark:text-gray-400">Manage your fees and payments</p>
        </div>
      </div>

      {/* Fee Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg bg-white dark:bg-[#0B1121] dark:text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <DollarSign className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-300">Total</Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Fees</p>
            <h3 className="text-2xl font-bold mt-1">₹{displayValues.totalFees.toLocaleString()}</h3>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white dark:bg-[#0B1121] dark:text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300">Paid</Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Paid Amount</p>
            <h3 className="text-2xl font-bold mt-1">₹{displayValues.paidAmount.toLocaleString()}</h3>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white dark:bg-[#0B1121] dark:text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <Badge variant="outline" className="border-red-200 text-red-700 dark:border-red-800 dark:text-red-300">Due</Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending Amount</p>
            <h3 className="text-2xl font-bold mt-1">₹{displayValues.pendingAmount.toLocaleString()}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Progress & Status */}
        <Card className="lg:col-span-2 border-0 shadow-lg bg-white dark:bg-[#0B1121] dark:text-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Payment Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Payment Progress</span>
                <span className="font-bold text-blue-500">{displayValues.completionPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(displayValues.completionPercentage, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-white/10">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Status</p>
                <Badge className={`${getStatusColor(feeDetails.payment_status)} text-white border-0`}>
                  {getStatusText(feeDetails.payment_status)}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Last Payment</p>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {feeDetails.paid_date ? new Date(feeDetails.paid_date).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History List */}
        <Card className="border-0 shadow-lg bg-white dark:bg-[#0B1121] dark:text-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentHistory.length > 0 ? (
                paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-white dark:bg-white/10 shadow-sm">
                        <Receipt className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">₹{payment.payment_amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(payment.payment_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-white dark:bg-white/10">
                      {payment.payment_method}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No transactions yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentFeeDetails;
