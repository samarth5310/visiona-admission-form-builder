import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, CreditCard, Clock, IndianRupee } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardMetrics {
  totalStudents: number;
  totalFeesCollected: number;
  pendingAmount: number;
  collectionRate: number;
}

interface RecentPayment {
  id: string;
  student_name: string;
  payment_amount: number;
  payment_date: string;
  payment_method: string;
}

const FeesDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalStudents: 0,
    totalFeesCollected: 0,
    pendingAmount: 0,
    collectionRate: 0
  });
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');

      // Fetch metrics
      const { data: studentsData, error: studentsError } = await supabase
        .from('applications')
        .select(`
          id,
          full_name,
          class,
          student_fees (
            total_fees,
            paid_amount,
            pending_amount
          )
        `);

      if (studentsError) throw studentsError;

      // Calculate metrics
      const totalStudents = studentsData.length;
      let totalFeesCollected = 0;
      let pendingAmount = 0;
      let totalFees = 0;

      studentsData.forEach(student => {
        const fees = Array.isArray(student.student_fees) 
          ? student.student_fees[0] 
          : student.student_fees;
        
        if (fees) {
          totalFeesCollected += fees.paid_amount || 0;
          pendingAmount += fees.pending_amount || 0;
          totalFees += fees.total_fees || 0;
        }
      });

      const collectionRate = totalFees > 0 ? Math.round((totalFeesCollected / totalFees) * 100) : 0;

      setMetrics({
        totalStudents,
        totalFeesCollected,
        pendingAmount,
        collectionRate
      });

      // Fetch recent payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('fee_payments')
        .select(`
          id,
          payment_amount,
          payment_date,
          payment_method,
          student_fees (
            application_id,
            applications (
              full_name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (paymentsError) throw paymentsError;

      const formattedPayments: RecentPayment[] = paymentsData.map(payment => ({
        id: payment.id,
        student_name: payment.student_fees?.applications?.full_name || 'Unknown',
        payment_amount: payment.payment_amount,
        payment_date: payment.payment_date,
        payment_method: payment.payment_method
      }));

      setRecentPayments(formattedPayments);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalStudents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees Collected</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(metrics.totalFeesCollected)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(metrics.pendingAmount)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.collectionRate}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments and Overdue Alerts */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent payments</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{payment.student_name}</p>
                      <p className="text-xs text-gray-500">{formatDate(payment.payment_date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(payment.payment_amount)}</p>
                      {getMethodBadge(payment.payment_method)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeesDashboard;
