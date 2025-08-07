
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, MessageCircle } from 'lucide-react';
import AttendanceSheet from './AttendanceSheet';
import AttendanceHistory from './AttendanceHistory';

interface Student {
  id: string;
  full_name: string;
  contact_number: string;
  class: string;
}

interface AttendanceRecord {
  id: string;
  student_id: string;
  attendance_date: string;
  status: 'present' | 'absent';
  marked_by?: string;
  notes?: string;
  student_name?: string;
  contact_number?: string;
}

const AttendanceManagement = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'mark' | 'history'>('mark');
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAttendanceForDate(selectedDate);
    }
  }, [selectedDate]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('id, full_name, contact_number, class')
        .order('full_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to fetch students list",
        variant: "destructive",
      });
    }
  };

  const fetchAttendanceForDate = async (date: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('attendance')
        .select(`
          *,
          applications!student_id (
            full_name,
            contact_number
          )
        `)
        .eq('attendance_date', date);

      if (error) throw error;

      const formattedData = data?.map(record => ({
        id: record.id,
        student_id: record.student_id,
        attendance_date: record.attendance_date,
        status: record.status as 'present' | 'absent',
        marked_by: record.marked_by,
        notes: record.notes,
        student_name: (record.applications as any)?.full_name || '',
        contact_number: (record.applications as any)?.contact_number || ''
      })) || [];

      setAttendanceRecords(formattedData);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast({
        title: "Error",
        description: "Failed to fetch attendance records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (studentId: string, status: 'present' | 'absent', notes?: string) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .upsert({
          student_id: studentId,
          attendance_date: selectedDate,
          status,
          marked_by: 'Admin',
          notes: notes || null,
        }, {
          onConflict: 'student_id,attendance_date'
        });

      if (error) throw error;

      await fetchAttendanceForDate(selectedDate);
      
      toast({
        title: "Success",
        description: `Attendance marked as ${status}`,
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      });
    }
  };

  const sendWhatsAppMessage = (phoneNumber: string, studentName: string, date: string) => {
    const message = `Dear Parent, your child ${studentName} was marked absent on ${new Date(date).toLocaleDateString()}. Please ensure regular attendance for better academic progress.`;
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Attendance Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Select Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="flex gap-2 mt-4 sm:mt-6">
              <Button
                variant={activeTab === 'mark' ? 'default' : 'outline'}
                onClick={() => setActiveTab('mark')}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Mark Attendance
              </Button>
              <Button
                variant={activeTab === 'history' ? 'default' : 'outline'}
                onClick={() => setActiveTab('history')}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                View History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 'mark' ? (
        <AttendanceSheet
          students={students}
          attendanceRecords={attendanceRecords}
          selectedDate={selectedDate}
          loading={loading}
          onMarkAttendance={markAttendance}
          onSendWhatsApp={sendWhatsAppMessage}
        />
      ) : (
        <AttendanceHistory />
      )}
    </div>
  );
};

export default AttendanceManagement;
