import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, CreditCard, IndianRupee, Settings, Plus, Sparkles } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardWhatsAppIntegration from './DashboardWhatsAppIntegration';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

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
  const [settings, setSettings] = useState({ upi_id: '', merchant_name: '', address: '', phone: '' });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase.from('institution_settings').select('*').maybeSingle();
    if (error) {
      console.error('Error fetching institution settings:', error);
      return;
    }
    if (data) setSettings({
      upi_id: data.upi_id,
      merchant_name: data.merchant_name,
      address: data.address || '',
      phone: data.phone || ''
    });
  };

  const saveSettings = async () => {
    try {
      const { error } = await supabase.from('institution_settings').upsert({
        id: (await supabase.from('institution_settings').select('id').maybeSingle()).data?.id || undefined,
        upi_id: settings.upi_id,
        merchant_name: settings.merchant_name,
        address: settings.address,
        phone: settings.phone
      });
      if (error) throw error;
      toast({ title: "Settings Saved", description: "Institution payment settings updated." });
      setIsSettingsOpen(false);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data: studentsData, error: studentsError } = await supabase
        .from('applications')
        .select(`
          id,
          student_fees (
            total_fees,
            paid_amount,
            pending_amount
          )
        `);

      if (studentsError) throw studentsError;

      const totalStudents = studentsData.length;
      let totalFeesCollected = 0;
      let pendingAmount = 0;
      let totalFees = 0;

      studentsData.forEach(student => {
        const fees = Array.isArray(student.student_fees) ? student.student_fees[0] : student.student_fees;
        if (fees) {
          const studentTotalFees = Number(fees.total_fees || 0);
          const studentPaidAmount = Math.min(studentTotalFees, Math.max(0, Number(fees.paid_amount || 0)));
          const studentPendingAmount = Math.max(0, studentTotalFees - studentPaidAmount);

          totalFeesCollected += studentPaidAmount;
          pendingAmount += studentPendingAmount;
          totalFees += studentTotalFees;
        }
      });

      setMetrics({
        totalStudents,
        totalFeesCollected,
        pendingAmount,
        collectionRate: totalFees > 0 ? Math.round((totalFeesCollected / totalFees) * 100) : 0
      });

      const { data: paymentsData, error: paymentsError } = await supabase
        .from('fee_payments')
        .select(`
          id,
          payment_amount,
          payment_date,
          payment_method,
          student_fees (applications (full_name))
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (paymentsError) throw paymentsError;

      setRecentPayments(paymentsData.map(p => ({
        id: p.id,
        student_name: p.student_fees?.applications?.full_name || 'Unknown',
        payment_amount: p.payment_amount,
        payment_date: p.payment_date,
        payment_method: p.payment_method
      })));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"><div className="h-32 bg-gray-100 animate-pulse rounded-xl col-span-full"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-500" />
            Fees Ecosystem
          </h1>
          <p className="text-gray-500 text-sm">Real-time financial intelligence</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end w-full sm:w-auto">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 border-emerald-200 hover:bg-emerald-50 text-emerald-700">
                <Settings className="h-4 w-4" /> Institutions Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Institution Payment Settings</DialogTitle>
                <DialogDescription>
                  Configure your academy's UPI ID and Merchant name for student payments.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>UPI ID</Label>
                  <Input value={settings.upi_id} onChange={e => setSettings({ ...settings, upi_id: e.target.value })} placeholder="example@upi" />
                </div>
                <div className="space-y-2">
                  <Label>Merchant Name</Label>
                  <Input value={settings.merchant_name} onChange={e => setSettings({ ...settings, merchant_name: e.target.value })} placeholder="Visiona Academy" />
                </div>
                <div className="space-y-2">
                  <Label>Institution Address</Label>
                  <Input value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} placeholder="123 Education St, City" />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input value={settings.phone} onChange={e => setSettings({ ...settings, phone: e.target.value })} placeholder="+91 1234567890" />
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={saveSettings}>Save Settings</Button>
              </div>
            </DialogContent>
          </Dialog>
          <DashboardWhatsAppIntegration />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: metrics.totalFeesCollected, icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Outstanding', value: metrics.pendingAmount, icon: CreditCard, color: 'text-rose-600', bg: 'bg-rose-50' },
          { label: 'Active Learners', value: metrics.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', suffix: '' },
          { label: 'Efficiency', value: metrics.collectionRate, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', suffix: '%' },
        ].map((stat, i) => (
          <Card key={i} className="border-0 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-0">
              <div className="flex items-center p-6 gap-4">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                    {typeof stat.value === 'number' && stat.label.includes('Revenue') ? formatCurrency(stat.value) : stat.value}
                    {stat.suffix ?? ''}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-500" />
            Live Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPayments.map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-emerald-600 font-bold">
                    {payment.student_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{payment.student_name}</p>
                    <p className="text-xs text-gray-500">{new Date(payment.payment_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-600">{formatCurrency(payment.payment_amount)}</p>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-gray-400 border-gray-200">
                    {payment.payment_method}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeesDashboard;
