
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, IndianRupee, Calendar, Receipt } from 'lucide-react';

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
        .single();

      if (feeError && feeError.code !== 'PGRST116') {
        throw feeError;
      }

      setFeeDetails(feeData);

      // Fetch payment history if fee details exist
      if (feeData) {
        const { data: paymentData, error: paymentError } = await supabase
          .from('fee_payments')
          .select('*')
          .eq('student_fees_id', feeData.id)
          .order('payment_date', { ascending: false });

        if (paymentError) throw paymentError;
        setPaymentHistory(paymentData || []);
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Fee Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading fee details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!feeDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Fee Details
          </CardTitle>
          <CardDescription>Your fee information and payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No fee details available</p>
            <p className="text-sm text-gray-400">Fee information will appear here once set up by the admin</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fee Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Fee Summary
          </CardTitle>
          <CardDescription>Your current fee status and payment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total Fees</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                ₹{feeDetails.total_fees.toLocaleString()}
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Paid Amount</span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                ₹{feeDetails.paid_amount.toLocaleString()}
              </p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-800">Pending Amount</span>
              </div>
              <p className="text-2xl font-bold text-red-900">
                ₹{feeDetails.pending_amount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <Badge className={`${getStatusColor(feeDetails.payment_status)} text-white mt-1`}>
                {getStatusText(feeDetails.payment_status)}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Fee Category</p>
              <p className="font-medium capitalize">{feeDetails.fee_category}</p>
            </div>
          </div>

          {feeDetails.paid_date && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Last Payment: {new Date(feeDetails.paid_date).toLocaleDateString()}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payment History
            </CardTitle>
            <CardDescription>Record of all your fee payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <IndianRupee className="h-4 w-4 text-green-600" />
                      <span className="font-semibold">₹{payment.payment_amount.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-600 capitalize">
                      {payment.payment_method}
                    </p>
                    {payment.receipt_number && (
                      <p className="text-xs text-gray-500">
                        Receipt: {payment.receipt_number}
                      </p>
                    )}
                    {payment.notes && (
                      <p className="text-xs text-gray-500 mt-1">
                        {payment.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      Paid
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Payment Completion</span>
              <span>{((feeDetails.paid_amount / feeDetails.total_fees) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min((feeDetails.paid_amount / feeDetails.total_fees) * 100, 100)}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>₹{feeDetails.paid_amount.toLocaleString()} paid</span>
              <span>₹{feeDetails.total_fees.toLocaleString()} total</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentFeeDetails;
