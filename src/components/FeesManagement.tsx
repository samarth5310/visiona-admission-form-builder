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
import FeesDashboard from './FeesDashboard';
import InstallPWAButton from './InstallPWAButton';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";

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
  paid_date: string | null;
  fee_id?: string;
  fee_breakdown?: any;
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
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const fetchStudents = async () => {
    try {
      setLoading(true);


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
            payment_status,
            paid_date,
            fee_breakdown
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching students:', error);
        throw error;
      }



      const studentsWithFees: StudentWithFees[] = data.map(student => {
        // Fix: Handle both array and single object response from Supabase
        const studentFees = Array.isArray(student.student_fees)
          ? student.student_fees[0]
          : student.student_fees;

        const totalFees = Number(studentFees?.total_fees || 0);
        const paidAmount = Math.min(totalFees, Math.max(0, Number(studentFees?.paid_amount || 0)));
        const pendingAmount = Math.max(0, totalFees - paidAmount);
        const paymentStatus = totalFees <= 0
          ? 'not_set'
          : paidAmount >= totalFees
            ? 'paid'
            : paidAmount > 0
              ? 'partial'
              : 'pending';



        return {
          id: student.id,
          full_name: student.full_name,
          class: student.class || 'Not specified',
          contact_number: student.contact_number || 'Not provided',
          created_at: student.created_at,
          total_fees: totalFees,
          paid_amount: paidAmount,
          pending_amount: pendingAmount,
          payment_status: paymentStatus,
          paid_date: studentFees?.paid_date || null,
          fee_id: studentFees?.id,
          fee_breakdown: studentFees?.fee_breakdown || null
        };
      });


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
    setCurrentPage(1);
  }, [searchTerm, statusFilter, students]);

  const pageCount = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pageCount) {
      setCurrentPage(page);
    }
  };

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
      not_set: { label: 'Incomplete', className: 'bg-gray-100 text-gray-500 border-gray-200' },
      pending: { label: 'Due', className: 'bg-rose-50 text-rose-600 border-rose-100' },
      partial: { label: 'Partial', className: 'bg-amber-50 text-amber-600 border-amber-100' },
      paid: { label: 'Cleared', className: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_set;

    return (
      <Badge variant="outline" className={`${config.className} font-bold text-[10px] uppercase tracking-widest rounded-lg border px-2 py-0.5`}>
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
      <div className="text-center py-8">
        <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-4 text-gray-600" />
        <p className="text-gray-600">Loading student data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Dashboard */}
      <FeesDashboard />

      {/* Manage Student Fees Section */}
      <Card className="border-0 shadow-xl bg-white dark:bg-[#0B1121] overflow-hidden rounded-3xl">
        <CardHeader className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl">
                  <Users className="h-6 w-6" />
                </div>
                Student Directory
              </CardTitle>
              <p className="text-sm text-gray-500 font-medium">Manage financial profiles for {students.length} active learners</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-72 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-emerald-500 transition-colors" />
                <Input
                  placeholder="Scan by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-11 h-12 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-emerald-500/20"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-44 h-12 bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 rounded-2xl">
                  <SelectValue placeholder="Status Filter" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-200">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not_set">Not Set</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={fetchStudents}
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-2xl border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <RefreshCw className={`h-5 w-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">

          {/* Students List */}
          {filteredStudents.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              {students.length === 0 ? 'No students found' : 'No students match your search criteria'}
            </div>
          ) : (
            <>
              {/* Mobile Compact List View */}
              <div className="block sm:hidden space-y-2">
                {paginatedStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                          {student.full_name}
                        </h3>
                        {getStatusBadge(student.payment_status)}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
                        <span>Class {student.class}</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          {student.total_fees > 0 ? formatCurrency(student.paid_amount) : '₹0'} paid
                        </span>
                        {student.pending_amount > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-red-500 dark:text-red-400 font-medium">
                              {formatCurrency(student.pending_amount)} due
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleManageFees(student)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 text-xs flex-shrink-0"
                    >
                      Manage
                    </Button>
                  </div>
                ))}
              </div>

              {/* Desktop/Tablet Grid View */}
              <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedStudents.map((student) => {
                  const progress = student.total_fees > 0 ? (student.paid_amount / student.total_fees) * 100 : 0;
                  return (
                    <Card key={student.id} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gray-50/50 dark:bg-white/5 rounded-3xl overflow-hidden ring-1 ring-gray-100 dark:ring-white/5 hover:ring-emerald-500/30">
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center font-black text-emerald-600 text-lg group-hover:scale-110 transition-transform">
                              {student.full_name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{student.full_name}</h3>
                              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{student.class}</p>
                            </div>
                          </div>
                          {getStatusBadge(student.payment_status)}
                        </div>

                        <div className="space-y-4 mb-6">
                          <div className="flex justify-between items-end">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Total Payable</p>
                              <p className="text-lg font-black text-gray-900 dark:text-white">
                                {student.total_fees > 0 ? formatCurrency(student.total_fees) : '₹0'}
                              </p>
                            </div>
                            <div className="text-right space-y-1">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Balance Due</p>
                              <p className="text-lg font-black text-rose-600">
                                {formatCurrency(student.pending_amount)}
                              </p>
                            </div>
                          </div>

                          <div className="relative h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>

                        <Button
                          className="w-full h-11 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 hover:border-emerald-600 rounded-xl font-bold transition-all shadow-sm"
                          onClick={() => handleManageFees(student)}
                        >
                          Manage Profile
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {pageCount > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent className="gap-1">
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}
                          aria-disabled={currentPage === 1}
                          className={`h-8 text-xs ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''}`}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="px-2 py-1 text-xs font-medium">
                          {currentPage} / {pageCount}
                        </span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}
                          aria-disabled={currentPage === pageCount}
                          className={`h-8 text-xs ${currentPage === pageCount ? 'pointer-events-none opacity-50' : ''}`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}

          {/* Fee Details Modal */}
          <FeeDetailsModal
            student={selectedStudent}
            isOpen={showModal}
            onClose={handleModalClose}
            onUpdate={handleModalUpdate}
          />

          <InstallPWAButton />
        </CardContent>
      </Card>
    </div>
  );
};

export default FeesManagement;