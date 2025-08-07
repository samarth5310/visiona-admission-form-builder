
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Download, Filter } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AttendanceHistoryRecord {
  id: string;
  student_id: string;
  attendance_date: string;
  status: 'present' | 'absent';
  marked_by?: string;
  notes?: string;
  created_at: string;
  student_name?: string;
  student_class?: string;
  contact_number?: string;
}

const AttendanceHistory = () => {
  const [records, setRecords] = useState<AttendanceHistoryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'present' | 'absent'>('all');
  const [searchStudent, setSearchStudent] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Set default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchAttendanceHistory();
    }
  }, [startDate, endDate, selectedStatus, searchStudent]);

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('attendance')
        .select(`
          *,
          applications!student_id (
            full_name,
            class,
            contact_number
          )
        `)
        .gte('attendance_date', startDate)
        .lte('attendance_date', endDate)
        .order('attendance_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      let formattedData = data?.map(record => ({
        id: record.id,
        student_id: record.student_id,
        attendance_date: record.attendance_date,
        status: record.status as 'present' | 'absent',
        marked_by: record.marked_by,
        notes: record.notes,
        created_at: record.created_at,
        student_name: (record.applications as any)?.full_name || '',
        student_class: (record.applications as any)?.class || '',
        contact_number: (record.applications as any)?.contact_number || ''
      })) || [];

      // Filter by student name if search term is provided
      if (searchStudent) {
        formattedData = formattedData.filter(record =>
          record.student_name.toLowerCase().includes(searchStudent.toLowerCase())
        );
      }

      setRecords(formattedData);
    } catch (error) {
      console.error('Error fetching attendance history:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Student Name', 'Class', 'Status', 'Marked By', 'Notes'];
    const csvData = records.map(record => [
      record.attendance_date,
      record.student_name,
      record.student_class,
      record.status,
      record.marked_by || '',
      record.notes || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_history_${startDate}_to_${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Attendance history exported successfully",
    });
  };

  const getStatusStats = () => {
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;
    const absent = records.filter(r => r.status === 'absent').length;
    
    return { total, present, absent };
  };

  const { total, present, absent } = getStatusStats();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'all' | 'present' | 'absent')}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </div>
            <div>
              <Label htmlFor="student-search">Search Student</Label>
              <Input
                id="student-search"
                placeholder="Search by name..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-blue-600">{total}</div>
              <div className="text-sm text-blue-600">Total Records</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-green-600">{present}</div>
              <div className="text-sm text-green-600">Present</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="text-xl font-bold text-red-600">{absent}</div>
              <div className="text-sm text-red-600">Absent</div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={exportToCSV} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export to CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance History ({records.length} records)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading attendance history...</div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No attendance records found for the selected criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Marked By</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Recorded At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {new Date(record.attendance_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{record.student_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.student_class}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={record.status === 'present' ? 'default' : 'destructive'}
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.marked_by || '-'}</TableCell>
                      <TableCell>
                        {record.notes ? (
                          <div className="max-w-xs truncate" title={record.notes}>
                            {record.notes}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(record.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceHistory;
