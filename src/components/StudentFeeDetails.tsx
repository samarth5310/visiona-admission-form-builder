
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
        .maybeSingle();

      if (feeError) {
        throw feeError;
      }

      // Fix calculation issues by ensuring proper logic
      if (feeData) {
        // Ensure pending amount is never negative
        const correctedPendingAmount = Math.max(0, feeData.total_fees - feeData.paid_amount);
        
        // Update the local state with corrected values
        const correctedFeeData = {
          ...feeData,
          pending_amount: correctedPendingAmount,
          // Ensure paid amount doesn't exceed total fees
          paid_amount: Math.min(feeData.paid_amount, feeData.total_fees)
        };

        setFeeDetails(correctedFeeData);

        // If there's a calculation mismatch in the database, update it
        if (feeData.pending_amount !== correctedPendingAmount || feeData.paid_amount > feeData.total_fees) {
          console.log('Correcting fee calculation in database...');
          const { error: updateError } = await supabase
            .from('student_fees')
            .update({
              pending_amount: correctedPendingAmount,
              paid_amount: Math.min(feeData.paid_amount, feeData.total_fees),
              payment_status: correctedPendingAmount === 0 ? 'paid' : 
                            feeData.paid_amount > 0 ? 'partial' : 'pending'
            })
            .eq('id', feeData.id);

          if (updateError) {
            console.error('Error updating fee calculation:', updateError);
          }
        }

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

  // Calculate correct values to display
  const getDisplayValues = (feeDetails: FeeDetails) => {
    const totalFees = feeDetails.total_fees;
    const paidAmount = Math.min(feeDetails.paid_amount, totalFees); // Ensure paid doesn't exceed total
    const pendingAmount = Math.max(0, totalFees - paidAmount); // Ensure pending is never negative
    
    return {
      totalFees,
      paidAmount,
      pendingAmount,
      completionPercentage: totalFees > 0 ? (paidAmount / totalFees) * 100 : 0
    };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CreditCard className="h-5 w-5" />
            Fee Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">Loading fee details...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!feeDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CreditCard className="h-5 w-5" />
            Fee Details
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">Your fee information and payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 sm:py-12">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">No fee details available</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Fee information will appear here once set up by the admin</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayValues = getDisplayValues(feeDetails);

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Fee Summary */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CreditCard className="h-5 w-5" />
            Fee Summary
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">Your current fee status and payment information</CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="h-4 w-4 text-blue-600" />
                <span className="text-xs sm:text-sm font-medium text-blue-800">Total Fees</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-blue-900">
                ₹{displayValues.totalFees.toLocaleString()}
              </p>
            </div>

            <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="h-4 w-4 text-green-600" />
                <span className="text-xs sm:text-sm font-medium text-green-800">Paid Amount</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-green-900">
                ₹{displayValues.paidAmount.toLocaleString()}
              </p>
            </div>

            <div className="bg-red-50 p-3 sm:p-4 rounded-lg sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="h-4 w-4 text-red-600" />
                <span className="text-xs sm:text-sm font-medium text-red-800">Pending Amount</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-red-900">
                ₹{displayValues.pendingAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Payment Status</p>
              <Badge className={`${getStatusColor(feeDetails.payment_status)} text-white mt-1 text-xs`}>
                {getStatusText(feeDetails.payment_status)}
              </Badge>
            </div>
            <div className="sm:text-right">
              <p className="text-xs sm:text-sm text-gray-600">Fee Category</p>
              <p className="font-medium capitalize text-sm sm:text-base">{feeDetails.fee_category}</p>
            </div>
          </div>

          {feeDetails.paid_date && (
            <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>Last Payment: {new Date(feeDetails.paid_date).toLocaleDateString()}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Receipt className="h-5 w-5" />
              Payment History
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">Record of all your fee payments</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-3 sm:gap-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <IndianRupee className="h-4 w-4 text-green-600 shrink-0" />
                      <span className="font-semibold text-sm sm:text-base">₹{payment.payment_amount.toLocaleString()}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 capitalize">
                      {payment.payment_method}
                    </p>
                    {payment.receipt_number && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Receipt: {payment.receipt_number}
                      </p>
                    )}
                    {payment.notes && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {payment.notes}
                      </p>
                    )}
                  </div>
                  <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                    <p className="text-xs sm:text-sm font-medium">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </p>
                    <Badge variant="outline" className="text-xs">
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
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Payment Progress</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span>Payment Completion</span>
              <span className="font-medium">{displayValues.completionPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
              <div 
                className="bg-green-500 h-2 sm:h-3 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(displayValues.completionPercentage, 100)}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 pt-1">
              <span>₹{displayValues.paidAmount.toLocaleString()} paid</span>
              <span>₹{displayValues.totalFees.toLocaleString()} total</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentFeeDetails;
