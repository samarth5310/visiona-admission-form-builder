
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Users, CreditCard } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import FeeDetailsModal from './FeeDetailsModal';

interface StudentWithFees {
  id: string;
  full_name: string;
  class: string;
  contact_number: string;
  created_at: string;
  total_fees: number;
  paid_amount: number;
  pending_amount: number;
  payment_status: string;
  fee_id?: string;
}

const FeesManagement = () => {
  const [students, setStudents] = useState<StudentWithFees[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentWithFees[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithFees | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log('Fetching students with fee information...');
      
      const { data, error } = await supabase
        .from('applications')
        .select(`
          id,
          full_name,
          class,
          contact_number,
          created_at,
          student_fees (
            id,
            total_fees,
            paid_amount,
            pending_amount,
            payment_status
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }

      console.log('Raw data from database:', data);

      const studentsWithFees: StudentWithFees[] = data.map(student => {
        // Fix: Handle both array and single object response from Supabase
        const studentFees = Array.isArray(student.student_fees) 
          ? student.student_fees[0] 
          : student.student_fees;

        console.log('Processing student:', student.full_name, 'fees data:', studentFees);

        return {
          id: student.id,
          full_name: student.full_name,
          class: student.class || 'Not specified',
          contact_number: student.contact_number || 'Not provided',
          created_at: student.created_at,
          total_fees: Number(studentFees?.total_fees) || 0,
          paid_amount: Number(studentFees?.paid_amount) || 0,
          pending_amount: Number(studentFees?.pending_amount) || 0,
          payment_status: studentFees?.payment_status || 'not_set',
          fee_id: studentFees?.id
        };
      });

      console.log('Processed students data:', studentsWithFees);
      setStudents(studentsWithFees);
      setFilteredStudents(studentsWithFees);
    } catch (error) {
      console.error('Error in fetchStudents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch student data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    let filtered = students.filter(student =>
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.payment_status === statusFilter);
    }

    setFilteredStudents(filtered);
  }, [searchTerm, statusFilter, students]);

  const handleManageFees = (student: StudentWithFees) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedStudent(null);
  };

  const handleModalUpdate = () => {
    fetchStudents();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      not_set: { label: 'Not Set', variant: 'secondary' as const, className: 'bg-gray-200 text-gray-800' },
      pending: { label: 'Pending', variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
      partial: { label: 'Partial', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800' },
      paid: { label: 'Paid', variant: 'secondary' as const, className: 'bg-green-100 text-green-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_set;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-8">
            <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-600">Loading student data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg mb-4 sm:mb-6">
          <div className="text-center border-b-2 border-gray-500 pb-3 sm:pb-6 mb-4 sm:mb-8 bg-gray-200 rounded-t-lg p-3 sm:p-6">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-700 mb-1 sm:mb-2">FEES MANAGEMENT</h1>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700">Student Fee Tracking and Payment Management</p>
          </div>

          {/* Stats and Controls */}
          <div className="p-3 sm:p-6">
            <div className="flex flex-col space-y-3 sm:space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className="flex items-center gap-2 text-gray-700 text-sm sm:text-base">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-semibold">Total: {students.length}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 text-sm sm:text-base">
                  <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-semibold">Shown: {filteredStudents.length}</span>
                </div>
              </div>
              
              <Button 
                onClick={fetchStudents} 
                variant="outline" 
                className="flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto"
                disabled={loading}
                size="sm"
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:gap-4 mb-4 sm:mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 sm:h-4 sm:w-4" />
                <Input
                  placeholder="Search students by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 sm:pl-10 text-sm"
                  size="sm"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 md:w-48 text-sm">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not_set">Not Set</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Students Grid */}
            {filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                {students.length === 0 ? 'No students found' : 'No students match your search criteria'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredStudents.map((student) => (
                  <Card key={student.id} className="hover:shadow-md transition-shadow border border-gray-200">
                    <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-6">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-sm sm:text-lg font-semibold text-gray-800 truncate leading-tight">
                          {student.full_name}
                        </CardTitle>
                        <div className="flex-shrink-0">
                          {getStatusBadge(student.payment_status)}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0 p-3 sm:p-6 sm:pt-0">
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Class:</span>
                          <span className="font-medium truncate ml-2">{student.class}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium text-xs sm:text-sm truncate ml-2">{student.contact_number}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Applied:</span>
                          <span className="font-medium text-xs sm:text-sm">{formatDate(student.created_at)}</span>
                        </div>
                        
                        <div className="border-t pt-1.5 sm:pt-2 mt-1.5 sm:mt-2 space-y-1 sm:space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total:</span>
                            <span className="font-medium text-blue-600 text-xs sm:text-sm">
                              {student.total_fees > 0 ? formatCurrency(student.total_fees) : 'Not Set'}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Paid:</span>
                            <span className="font-medium text-green-600 text-xs sm:text-sm">
                              {formatCurrency(student.paid_amount)}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Pending:</span>
                            <span className="font-medium text-red-600 text-xs sm:text-sm">
                              {student.total_fees > 0 ? formatCurrency(student.pending_amount) : 'Not Set'}
                            </span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full mt-2 sm:mt-3 text-xs sm:text-sm py-1.5 sm:py-2" 
                          variant="outline"
                          onClick={() => handleManageFees(student)}
                          size="sm"
                        >
                          Manage Fees
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Fee Details Modal */}
        <FeeDetailsModal
          student={selectedStudent}
          isOpen={showModal}
          onClose={handleModalClose}
          onUpdate={handleModalUpdate}
        />
      </div>
    </div>
  );
};

export default FeesManagement;
