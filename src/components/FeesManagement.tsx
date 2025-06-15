
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

      const studentsWithFees: StudentWithFees[] = data.map(student => ({
        id: student.id,
        full_name: student.full_name,
        class: student.class || 'Not specified',
        contact_number: student.contact_number || 'Not provided',
        created_at: student.created_at,
        total_fees: student.student_fees?.[0]?.total_fees || 0,
        paid_amount: student.student_fees?.[0]?.paid_amount || 0,
        pending_amount: student.student_fees?.[0]?.pending_amount || 0,
        payment_status: student.student_fees?.[0]?.payment_status || 'not_set',
        fee_id: student.student_fees?.[0]?.id
      }));

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
      <div className="min-h-screen bg-gray-50 px-2 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto py-4 sm:py-6">
          <div className="text-center py-8">
            <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-600">Loading student data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto py-4 sm:py-6">
        {/* Header */}
        <div className="bg-white border-2 sm:border-4 border-gray-300 rounded-lg shadow-lg mb-6">
          <div className="text-center border-b-2 border-gray-500 pb-4 sm:pb-6 mb-6 sm:mb-8 bg-gray-200 rounded-t-lg p-3 sm:p-6">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-700 mb-2">FEES MANAGEMENT</h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-700">Student Fee Tracking and Payment Management</p>
          </div>

          {/* Stats and Controls */}
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">Total Students: {students.length}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <CreditCard className="h-5 w-5" />
                  <span className="font-semibold">Displayed: {filteredStudents.length}</span>
                </div>
              </div>
              
              <Button 
                onClick={fetchStudents} 
                variant="outline" 
                className="flex items-center gap-2"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search students by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
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
              <div className="text-center py-8 text-gray-500">
                {students.length === 0 ? 'No students found' : 'No students match your search criteria'}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredStudents.map((student) => (
                  <Card key={student.id} className="hover:shadow-md transition-shadow border border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-semibold text-gray-800 truncate">
                          {student.full_name}
                        </CardTitle>
                        {getStatusBadge(student.payment_status)}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Class:</span>
                          <span className="font-medium">{student.class}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{student.contact_number}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Applied:</span>
                          <span className="font-medium">{formatDate(student.created_at)}</span>
                        </div>
                        
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Fees:</span>
                            <span className="font-medium text-blue-600">
                              {student.total_fees > 0 ? formatCurrency(student.total_fees) : 'Not Set'}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-gray-600">Paid:</span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(student.paid_amount)}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pending:</span>
                            <span className="font-medium text-red-600">
                              {student.total_fees > 0 ? formatCurrency(student.pending_amount) : 'Not Set'}
                            </span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full mt-3" 
                          variant="outline"
                          onClick={() => handleManageFees(student)}
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
