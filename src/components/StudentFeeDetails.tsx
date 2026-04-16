import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, IndianRupee, Calendar, Receipt, DollarSign, AlertCircle, CheckCircle2, Clock, Smartphone, ShieldCheck, ArrowRight } from 'lucide-react';
import { safeStorage } from '@/utils/safeStorage';
import UPIPaymentSheet from './UPIPaymentSheet';
import { getInstitutionSettings } from '@/utils/upiUtils';
import { useToast } from '@/hooks/use-toast';

interface FeeDetails {
  id: string;
  total_fees: number;
  paid_amount: number;
  pending_amount: number;
  payment_status: string;
  fee_category: string;
  paid_date: string | null;
  fee_breakdown: any;
}

interface PaymentHistory {
  id: string;
  payment_amount: number;
  payment_date: string;
  payment_method: string;
  verification_status: 'pending_verification' | 'verified' | 'rejected';
  submitted_utr: string | null;
  transaction_id: string | null;
  receipt_number: string | null;
  notes: string | null;
}

const StudentFeeDetails = () => {
  const [feeDetails, setFeeDetails] = useState<FeeDetails | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUPIOpen, setIsUPIOpen] = useState(false);
  const [institution, setInstitution] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    fetchFeeDetails();
    fetchInstitutionSettings();

    // Use unique channel names to avoid duplicate subscription errors
    const channelId = Date.now();
    const feeChannel = supabase
      .channel(`student-fees-changes-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_fees'
        },
        () => {
          if (mounted) fetchFeeDetails();
        }
      )
      .subscribe();

    const paymentChannel = supabase
      .channel(`fee-payments-changes-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fee_payments'
        },
        () => {
          if (mounted) fetchFeeDetails();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      // Delay cleanup to avoid "closed before established" errors
      setTimeout(() => {
        supabase.removeChannel(feeChannel);
        supabase.removeChannel(paymentChannel);
      }, 100);
    };
  }, []);

  const fetchInstitutionSettings = async () => {
    const settings = await getInstitutionSettings();
    setInstitution(settings);
  };

  const fetchFeeDetails = async () => {
    try {
      const studentData = safeStorage.getItem('visiona_student_data');
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
      setError('Failed to load fee details');
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-dashed border-2 bg-gray-50 dark:bg-white/5 dark:border-white/10">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Error Loading Fees</h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mt-2">
            {error}. Please try refreshing the page.
          </p>
        </CardContent>
      </Card>
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
  const pendingVerificationCount = paymentHistory.filter(p => p.verification_status === 'pending_verification').length;

  const handleUPISuccess = async (transactionId: string) => {
    try {
      const utr = transactionId.trim();
      if (utr.length < 8) {
        toast({
          title: "Invalid UTR",
          description: "Please enter a valid UTR/transaction reference.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await (supabase.from('fee_payments') as any).insert({
        student_fees_id: feeDetails!.id,
        payment_amount: displayValues.pendingAmount,
        payment_method: 'upi',
        transaction_id: utr,
        submitted_utr: utr,
        verification_status: 'pending_verification',
        payment_date: new Date().toISOString().split('T')[0],
        notes: `UPI payment submitted by student. Awaiting office verification. UTR: ${utr}`
      });

      if (error) throw error;

      toast({
        title: "Payment Sent To Office",
        description: "Your UTR was submitted successfully. Verification usually completes within 6 hours.",
      });

      setIsUPIOpen(false);
      fetchFeeDetails();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Financial Hub</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Clear insights into your educational investment</p>
        </div>
        {displayValues.pendingAmount > 0 && institution && (
          <Button
            onClick={() => setIsUPIOpen(true)}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold shadow-xl shadow-emerald-500/20 gap-2 border-0 h-12 px-8 rounded-xl"
          >
            <Smartphone className="h-5 w-5" />
            Make Fast Payment
            <ArrowRight className="h-4 w-4 opacity-70" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total Payable', value: displayValues.totalFees, icon: IndianRupee, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Amount Cleared', value: displayValues.paidAmount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: 'Balance Due', value: displayValues.pendingAmount, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
        ].map((card, i) => (
          <Card key={i} className={`border-0 shadow-lg ${card.bg} dark:bg-gray-800/20`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.bg} dark:bg-gray-700 ${card.color} p-3 rounded-2xl shadow-sm`}>
                  <card.icon className="h-6 w-6" />
                </div>
                <Badge variant="outline" className={`${card.border} dark:border-gray-700 font-bold uppercase tracking-widest text-[10px]`}>
                  {card.label.split(' ')[1]}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{card.label}</p>
              <h3 className="text-3xl font-black mt-1 dark:text-white">₹{card.value.toLocaleString()}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      {pendingVerificationCount > 0 && (
        <Card className="border-amber-200 bg-amber-50/80 dark:bg-amber-900/20 dark:border-amber-700/40">
          <CardContent className="p-4 flex items-start gap-3">
            <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100">
                {pendingVerificationCount} payment{pendingVerificationCount > 1 ? 's are' : ' is'} under verification
              </p>
              <p className="text-sm text-amber-800/80 dark:text-amber-200/80">
                Payment sent to office. Verification is usually completed within 6 hours.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-xl bg-white dark:bg-[#0B1121] overflow-hidden rounded-2xl">
            <CardHeader className="bg-gray-50 dark:bg-white/5 py-4">
              <CardTitle className="text-lg font-black flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-500" /> Fee Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {feeDetails.fee_breakdown && (feeDetails.fee_breakdown as any[]).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center font-bold text-gray-400">
                        {idx + 1}
                      </div>
                      <span className="font-bold text-gray-700 dark:text-gray-200">{item.name}</span>
                    </div>
                    <span className="font-black text-gray-900 dark:text-white">₹{(item.amount || 0).toLocaleString()}</span>
                  </div>
                ))}

                <div className="mt-8 space-y-3">
                  <div className="flex justify-between text-sm font-bold uppercase tracking-wider text-gray-400">
                    <span>Clearing Progress</span>
                    <span>{displayValues.completionPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-4 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-1000 ease-out shadow-lg"
                      style={{ width: `${Math.min(displayValues.completionPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-4">
            <ShieldCheck className="h-6 w-6 text-emerald-600 mt-1" />
            <div>
              <p className="font-bold text-emerald-900 dark:text-emerald-100">Secure Payments</p>
              <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80">All online payments are processed through the secure UPI network. Always verify the merchant name "<strong>{institution?.merchant_name}</strong>" before confirming your payment.</p>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-xl bg-white dark:bg-[#0B1121] overflow-hidden rounded-2xl">
          <CardHeader className="bg-gray-50 dark:bg-white/5 py-4 text-center">
            <CardTitle className="text-lg font-black flex items-center justify-center gap-2">
              <Clock className="h-5 w-5 text-emerald-500" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {paymentHistory.length > 0 ? (
                paymentHistory.map((payment) => (
                  <div key={payment.id} className="p-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                        {new Date(payment.payment_date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <Badge
                        className={`border-0 text-[10px] font-black uppercase ${
                          payment.verification_status === 'verified'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : payment.verification_status === 'rejected'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {payment.verification_status === 'verified'
                          ? 'Confirmed'
                          : payment.verification_status === 'rejected'
                            ? 'Rejected'
                            : 'Pending'}
                      </Badge>
                    </div>
                    <div className="flex items-end justify-between">
                      <h4 className="text-2xl font-black text-gray-900 dark:text-white">₹{payment.payment_amount.toLocaleString()}</h4>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{payment.payment_method}</span>
                    </div>
                    {(payment.submitted_utr || payment.transaction_id) && (
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        UTR: {payment.submitted_utr || payment.transaction_id}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-400 font-medium">
                  <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 mx-auto mb-4 flex items-center justify-center opacity-50">
                    <Receipt className="h-8 w-8" />
                  </div>
                  No transactions yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {institution && (
        <UPIPaymentSheet
          isOpen={isUPIOpen}
          onClose={() => setIsUPIOpen(false)}
          amount={displayValues.pendingAmount}
          upiId={institution.upi_id}
          merchantName={institution.merchant_name}
          studentName="You"
          onPaymentSubmitted={handleUPISuccess}
        />
      )}
    </div>
  );
};

export default StudentFeeDetails;
