
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { IndianRupee, User, CreditCard, Calendar, Receipt, Users, TrendingUp } from 'lucide-react';
import StudentSelector from './StudentSelector';
import PaymentForm from './PaymentForm';
import PaymentHistory from './PaymentHistory';
import FeeDetailsModal from './FeeDetailsModal';
import FeesDashboard from './FeesDashboard';

interface Student {
  id: string;
  full_name: string;
  class: string;
  admission_number: string;
  contact_number: string;
  student_fees?: StudentFee[];
}

interface StudentFee {
  id: string;
  total_fees: number;
  paid_amount: number;
  pending_amount: number;
  payment_status: 'pending' | 'partial' | 'paid';
  fee_category: string;
  paid_date?: string;
}

const FeesManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showFeeDetails, setShowFeeDetails] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'students'>('dashboard');
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, classFilter, statusFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log('Fetching students with fees...');

      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          full_name,
          class,
          admission_number,
          contact_number,
          student_fees (
            id,
            total_fees,
            paid_amount,
            pending_amount,
            payment_status,
            fee_category,
            paid_date
          )
        `)
        .order('full_name');

      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }

      console.log('Students data fetched:', data);
      setStudents(data || []);
      
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.admission_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Class filter
    if (classFilter !== 'all') {
      filtered = filtered.filter(student => student.class === classFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => {
        const fees = Array.isArray(student.student_fees) ? student.student_fees[0] : student.student_fees;
        if (!fees) return statusFilter === 'no_fees';
        return fees.payment_status === statusFilter;
      });
    }

    setFilteredStudents(filtered);
  };

  const createStudentFees = async (studentId: string, totalFees: number, feeCategory: string = 'tuition') => {
    try {
      console.log('Creating fees for student:', studentId, 'Amount:', totalFees);
      
      const { data, error } = await supabase
        .from('student_fees')
        .insert([{
          application_id: studentId,
          total_fees: totalFees,
          paid_amount: 0,
          pending_amount: totalFees,
          payment_status: 'pending',
          fee_category: feeCategory
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating student fees:', error);
        throw error;
      }

      console.log('Fees created successfully:', data);
      
      toast({
        title: "Success",
        description: "Fee structure created successfully!",
      });
      
      fetchStudents();
      return data;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to create fee structure. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateFeeStatus = async (studentId: string, newStatus: 'pending' | 'partial' | 'paid') => {
    try {
      const student = students.find(s => s.id === studentId);
      if (!student) return;

      const fees = Array.isArray(student.student_fees) ? student.student_fees[0] : student.student_fees;
      if (!fees) return;

      let updateData: any = {
        payment_status: newStatus,
        updated_at: new Date().toISOString()
      };

      // If marking as fully paid, ensure paid_amount equals total_fees and pending is 0
      if (newStatus === 'paid') {
        updateData.paid_amount = fees.total_fees;
        updateData.pending_amount = 0;
        updateData.paid_date = new Date().toISOString().split('T')[0];
      }
      // If marking as pending, reset to original state
      else if (newStatus === 'pending') {
        updateData.paid_amount = 0;
        updateData.pending_amount = fees.total_fees;
        updateData.paid_date = null;
      }

      console.log('Updating fee status:', updateData);

      const { error } = await supabase
        .from('student_fees')
        .update(updateData)
        .eq('id', fees.id);

      if (error) {
        console.error('Error updating fee status:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: `Fee status updated to ${newStatus}!`,
      });
      
      fetchStudents();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to update fee status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500 hover:bg-green-600';
      case 'partial': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'pending': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'partial': return 'Partial';
      case 'pending': return 'Pending';
      default: return 'Unknown';
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

  const uniqueClasses = [...new Set(students.map(s => s.class))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Navigation Tabs - Responsive */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <Button
          variant={currentView === 'dashboard' ? 'default' : 'outline'}
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <TrendingUp className="h-4 w-4" />
          Dashboard
        </Button>
        <Button
          variant={currentView === 'students' ? 'default' : 'outline'}
          onClick={() => setCurrentView('students')}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Users className="h-4 w-4" />
          Student Fees
        </Button>
      </div>

      {currentView === 'dashboard' ? (
        <FeesDashboard />
      ) : (
        <>
          {/* Search and Filter Section - Mobile Responsive */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Student Fee Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search Input */}
                <div className="w-full">
                  <Label htmlFor="search">Search Students</Label>
                  <Input
                    id="search"
                    placeholder="Search by name or admission number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mt-2"
                  />
                </div>

                {/* Filters - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Filter by Class</Label>
                    <Select value={classFilter} onValueChange={setClassFilter}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {uniqueClasses.map((cls) => (
                          <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Filter by Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="no_fees">No Fees Set</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students List - Mobile Responsive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredStudents.length === 0 ? (
              <div className="col-span-full">
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              filteredStudents.map((student) => {
                const fees = Array.isArray(student.student_fees) ? student.student_fees[0] : student.student_fees;
                
                return (
                  <Card key={student.id} className="hover:shadow-lg transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base sm:text-lg line-clamp-2">{student.full_name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            {student.class} • {student.admission_number}
                          </p>
                        </div>
                        {fees && (
                          <Badge className={`${getStatusColor(fees.payment_status)} text-white ml-2 text-xs shrink-0`}>
                            {getStatusText(fees.payment_status)}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {fees ? (
                        <>
                          {/* Fee Information */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Total Fees:</span>
                              <span className="font-semibold">{formatCurrency(fees.total_fees)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Paid:</span>
                              <span className="font-semibold text-green-600">{formatCurrency(fees.paid_amount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">Pending:</span>
                              <span className="font-semibold text-red-600">{formatCurrency(fees.pending_amount)}</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="space-y-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${Math.min((fees.paid_amount / fees.total_fees) * 100, 100)}%` 
                                }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>{((fees.paid_amount / fees.total_fees) * 100).toFixed(1)}% paid</span>
                              <span>{fees.fee_category}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(student);
                                setShowPaymentForm(true);
                              }}
                              className="flex items-center gap-1 text-xs flex-1"
                            >
                              <CreditCard className="h-3 w-3" />
                              Add Payment
                            </Button>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-1 text-xs flex-1"
                                >
                                  <Receipt className="h-3 w-3" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <FeeDetailsModal student={student} onUpdate={fetchStudents} />
                              </DialogContent>
                            </Dialog>
                          </div>

                          {/* Quick Status Update */}
                          <div className="pt-2 border-t">
                            <Label className="text-xs text-gray-600 mb-2 block">Quick Status Update:</Label>
                            <div className="flex gap-1">
                              {['pending', 'partial', 'paid'].map((status) => (
                                <Button
                                  key={status}
                                  variant={fees.payment_status === status ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => updateFeeStatus(student.id, status as any)}
                                  className="text-xs flex-1"
                                  disabled={fees.payment_status === status}
                                >
                                  {getStatusText(status)}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-center py-4">
                            <p className="text-gray-500 text-sm mb-4">No fee structure set for this student</p>
                            <StudentSelector
                              onFeesCreated={fetchStudents}
                              onCreateFees={createStudentFees}
                            />
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && selectedStudent && (
        <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Payment - {selectedStudent.full_name}</DialogTitle>
              <DialogDescription>
                Record a new fee payment for this student
              </DialogDescription>
            </DialogHeader>
            <PaymentForm
              onSuccess={() => {
                setShowPaymentForm(false);
                fetchStudents();
              }}
              onCancel={() => setShowPaymentForm(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FeesManagement;
