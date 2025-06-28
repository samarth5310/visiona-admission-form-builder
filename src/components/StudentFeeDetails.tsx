
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IndianRupee, CreditCard, Calendar } from 'lucide-react';

interface StudentFeeDetailsProps {
  studentId: string;
}

const StudentFeeDetails: React.FC<StudentFeeDetailsProps> = ({ studentId }) => {
  // Fetch fee details with real-time updates
  const { data: feeDetails, isLoading } = useQuery({
    queryKey: ['student-fees', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_fees')
        .select(`
          *,
          fee_payments (
            id,
            payment_amount,
            payment_date,
            payment_method,
            receipt_number
          )
        `)
        .eq('application_id', studentId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No fee record found
          return null;
        }
        throw error;
      }
      return data;
    }
  });

  // Set up real-time subscription for fee updates
  React.useEffect(() => {
    const channel = supabase
      .channel('student-fees-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_fees',
          filter: `application_id=eq.${studentId}`
        },
        () => {
          // Refetch fee details when there are changes
          window.location.reload(); // Simple approach, could be optimized
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fee_payments'
        },
        () => {
          // Refetch when payments are updated
          window.location.reload();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', text: 'Paid' },
      partial: { color: 'bg-yellow-100 text-yellow-800', text: 'Partial' },
      pending: { color: 'bg-red-100 text-red-800', text: 'Pending' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      cash: 'bg-green-100 text-green-800',
      bank_transfer: 'bg-blue-100 text-blue-800',
      upi: 'bg-purple-100 text-purple-800',
      card: 'bg-orange-100 text-orange-800',
      cheque: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={colors[method as keyof typeof colors] || colors.other}>
        {method.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading fee details...</p>
      </div>
    );
  }

  if (!feeDetails) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <IndianRupee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No fee information available.</p>
          <p className="text-sm text-gray-400 mt-2">Fee details will appear here once set up by the admin.</p>
        </CardContent>
      </Card>
    );
  }

  const payments = Array.isArray(feeDetails.fee_payments) ? feeDetails.fee_payments : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <IndianRupee className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Fee Details</h3>
      </div>

      {/* Fee Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Fee Summary
            {getStatusBadge(feeDetails.payment_status)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Fees</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(feeDetails.total_fees)}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Paid Amount</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(feeDetails.paid_amount)}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(feeDetails.pending_amount)}
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Category: {feeDetails.fee_category}</span>
              {feeDetails.paid_date && (
                <span>Last Payment: {new Date(feeDetails.paid_date).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.map((payment: any) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{formatCurrency(payment.payment_amount)}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(payment.payment_date).toLocaleDateString('en-IN')}
                    </p>
                    {payment.receipt_number && (
                      <p className="text-xs text-gray-500">Receipt: {payment.receipt_number}</p>
                    )}
                  </div>
                  <div className="text-right">
                    {getMethodBadge(payment.payment_method)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentFeeDetails;
