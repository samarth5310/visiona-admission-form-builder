import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LogOut, Download, User, Phone, Calendar, School, MapPin, Mail, BookOpen, CreditCard, IndianRupee } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface StudentData {
  id: string;
  full_name: string;
  contact_number: string;
  email: string;
  date_of_birth: string;
  father_name: string;
  mother_name: string;
  current_school: string;
  class: string;
  admission_number: string;
  street_address: string;
  city: string;
  state: string;
  pin_code: string;
  exams_preparing_for: string[];
  category: string;
  last_year_percentage: number;
  created_at: string;
}

interface FeeData {
  id: string;
  total_fees: number;
  paid_amount: number;
  pending_amount: number;
  payment_status: string;
  paid_date: string | null;
  fee_category: string;
  created_at: string;
  updated_at: string;
}

interface PaymentHistory {
  id: string;
  payment_amount: number;
  payment_date: string;
  payment_method: string;
  transaction_id: string | null;
  receipt_number: string | null;
  notes: string | null;
  created_at: string;
}

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [feeData, setFeeData] = useState<FeeData | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loadingFees, setLoadingFees] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const storedData = localStorage.getItem('visiona_student_data');
    if (!storedData) {
      navigate('/student-login', { replace: true });
      return;
    }

    try {
      const parsedData = JSON.parse(storedData);
      setStudentData(parsedData);
      fetchFeeDetails(parsedData.id);
    } catch (error) {
      console.error('Error parsing student data:', error);
      localStorage.removeItem('visiona_student_data');
      navigate('/student-login', { replace: true });
    }
  }, [navigate]);

  const fetchFeeDetails = async (studentId: string) => {
    try {
      setLoadingFees(true);
      
      // Fetch fee details
      const { data: feeDetails, error: feeError } = await supabase
        .from('student_fees')
        .select('*')
        .eq('application_id', studentId)
        .maybeSingle();

      if (feeError && feeError.code !== 'PGRST116') {
        throw feeError;
      }

      setFeeData(feeDetails);

      // Fetch payment history if fee record exists
      if (feeDetails) {
        const { data: payments, error: paymentsError } = await supabase
          .from('fee_payments')
          .select('*')
          .eq('student_fees_id', feeDetails.id)
          .order('created_at', { ascending: false });

        if (paymentsError) {
          console.error('Error fetching payment history:', paymentsError);
        } else {
          setPaymentHistory(payments || []);
        }
      }
    } catch (error) {
      console.error('Error fetching fee details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch fee details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingFees(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('visiona_student_data');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/', { replace: true });
  };

  const handleDownloadIdCard = async () => {
    const idCardElement = document.getElementById('student-id-card');
    if (!idCardElement) return;

    try {
      const canvas = await html2canvas(idCardElement, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 53.98] // Credit card size
      });

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);
      pdf.save(`${studentData?.full_name}_ID_Card.pdf`);

      toast({
        title: "ID Card Downloaded",
        description: "Your student ID card has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download ID card. Please try again.",
        variant: "destructive",
      });
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      not_set: { label: 'Not Set', className: 'bg-gray-100 text-gray-800' },
      pending: { label: 'Pending', className: 'bg-red-100 text-red-800' },
      partial: { label: 'Partial', className: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Paid', className: 'bg-green-100 text-green-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_set;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      cash: 'bg-green-100 text-green-800',
      bank_transfer: 'bg-blue-100 text-blue-800',
      upi: 'bg-purple-100 text-purple-800',
      card: 'bg-orange-100 text-orange-800',
      cheque: 'bg-yellow-100 text-yellow-800',
      adjustment: 'bg-gray-100 text-gray-800',
      other: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[method as keyof typeof colors] || colors.other}`}>
        {method.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 sm:px-4 lg:px-6">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
              alt="Logo" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome, {studentData.full_name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => navigate('/homework')} 
              variant="outline" 
              className="flex items-center space-x-2"
            >
              <BookOpen className="h-4 w-4" />
              <span>My Homework</span>
            </Button>
            <Button onClick={handleLogout} variant="outline" className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-6">
        {/* Fee Status Overview */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                  Fee Status Overview
                </span>
                <Button
                  onClick={() => fetchFeeDetails(studentData.id)}
                  variant="outline"
                  size="sm"
                  disabled={loadingFees}
                >
                  {loadingFees ? 'Refreshing...' : 'Refresh'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingFees ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading fee details...</p>
                </div>
              ) : feeData ? (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Fees</p>
                          <p className="text-xl font-bold text-blue-600">
                            {formatCurrency(feeData.total_fees)}
                          </p>
                        </div>
                        <IndianRupee className="h-8 w-8 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Paid Amount</p>
                          <p className="text-xl font-bold text-green-600">
                            {formatCurrency(feeData.paid_amount)}
                          </p>
                        </div>
                        <IndianRupee className="h-8 w-8 text-green-600" />
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Pending Amount</p>
                          <p className="text-xl font-bold text-red-600">
                            {formatCurrency(feeData.pending_amount)}
                          </p>
                        </div>
                        <IndianRupee className="h-8 w-8 text-red-600" />
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Payment Status</p>
                          <div className="mt-1">
                            {getStatusBadge(feeData.payment_status)}
                          </div>
                        </div>
                        <CreditCard className="h-8 w-8 text-gray-600" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white p-3 rounded border">
                      <span className="text-gray-600">Fee Category:</span>
                      <span className="ml-2 font-medium capitalize">{feeData.fee_category}</span>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="ml-2 font-medium">{formatDate(feeData.updated_at)}</span>
                    </div>
                    {feeData.paid_date && (
                      <div className="bg-white p-3 rounded border">
                        <span className="text-gray-600">Last Payment Date:</span>
                        <span className="ml-2 font-medium text-green-600">{formatDate(feeData.paid_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Fee Structure Set</h3>
                  <p className="text-gray-600">Your fee structure has not been set up yet. Please contact the administration.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment History */}
        {feeData && paymentHistory.length > 0 && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-green-600" />
                  Payment History ({paymentHistory.length} payments)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-green-600">
                            {formatCurrency(payment.payment_amount)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(payment.payment_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getMethodBadge(payment.payment_method)}
                          {payment.transaction_id && (
                            <span className="text-xs text-gray-500">
                              TXN: {payment.transaction_id}
                            </span>
                          )}
                          {payment.receipt_number && (
                            <span className="text-xs text-gray-500">
                              Receipt: {payment.receipt_number}
                            </span>
                          )}
                        </div>
                        {payment.notes && (
                          <p className="text-xs text-gray-600 mt-1">{payment.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Student Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-600" />
              Personal Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Full Name:</span>
                <span className="font-medium">{studentData.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date of Birth:</span>
                <span className="font-medium">{new Date(studentData.date_of_birth).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Father's Name:</span>
                <span className="font-medium">{studentData.father_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Mother's Name:</span>
                <span className="font-medium">{studentData.mother_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium">{studentData.category}</span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Phone className="h-5 w-5 mr-2 text-green-600" />
              Contact Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Mobile:</span>
                <span className="font-medium">{studentData.contact_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{studentData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="font-medium text-right">{studentData.street_address}, {studentData.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">State:</span>
                <span className="font-medium">{studentData.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PIN Code:</span>
                <span className="font-medium">{studentData.pin_code}</span>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <School className="h-5 w-5 mr-2 text-purple-600" />
              Academic Information
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Current School:</span>
                <span className="font-medium">{studentData.current_school}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Class:</span>
                <span className="font-medium">{studentData.class}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Year %:</span>
                <span className="font-medium">{studentData.last_year_percentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Admission Number:</span>
                <span className="font-medium">{studentData.admission_number}</span>
              </div>
            </div>
          </div>

          {/* Exam Preparation */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-orange-600" />
              Exam Preparation
            </h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600">Preparing for:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {studentData.exams_preparing_for.map((exam, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {exam}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Enrolled On:</span>
                <span className="font-medium">{new Date(studentData.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Student ID Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Student ID Card</h2>
            <Button onClick={handleDownloadIdCard} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Download ID Card</span>
            </Button>
          </div>

          {/* ID Card */}
          <div className="flex justify-center">
            <div 
              id="student-id-card"
              className="w-[340px] h-[215px] bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg p-4 text-white shadow-lg relative overflow-hidden"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 w-20 h-20 border-2 border-white rounded-full"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 border-2 border-white rounded-full"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <img 
                      src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                      alt="Logo" 
                      className="w-8 h-8 bg-white rounded p-1"
                    />
                    <div>
                      <h3 className="text-sm font-bold">VISIONA EDUCATION</h3>
                      <p className="text-xs opacity-90">ACADEMY</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs opacity-90">Student ID</p>
                    <p className="text-sm font-bold">{studentData.admission_number}</p>
                  </div>
                </div>

                {/* Student Info */}
                <div className="flex-1">
                  <div className="mb-2">
                    <h4 className="text-lg font-bold truncate">{studentData.full_name}</h4>
                    <p className="text-xs opacity-90">Class: {studentData.class} | {studentData.category}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="opacity-90">Mobile:</p>
                      <p className="font-medium">{studentData.contact_number}</p>
                    </div>
                    <div>
                      <p className="opacity-90">DOB:</p>
                      <p className="font-medium">{new Date(studentData.date_of_birth).toLocaleDateString('en-GB')}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-white/20 pt-2 flex justify-between items-center text-xs">
                  <div>
                    <p className="opacity-90">Valid for Academic Year 2024-25</p>
                  </div>
                  <div className="text-right">
                    <p className="opacity-90">Bagalkot, Karnataka</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;