
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageCircle, Check, X, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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

interface AttendanceSheetProps {
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  selectedDate: string;
  loading: boolean;
  onMarkAttendance: (studentId: string, status: 'present' | 'absent', notes?: string) => void;
  onSendWhatsApp: (phoneNumber: string, studentName: string, date: string) => void;
}

const AttendanceSheet: React.FC<AttendanceSheetProps> = ({
  students,
  attendanceRecords,
  selectedDate,
  loading,
  onMarkAttendance,
  onSendWhatsApp,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});

  const classes = [...new Set(students.map(s => s.class))];
  
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  const getAttendanceRecord = (studentId: string) => {
    return attendanceRecords.find(record => record.student_id === studentId);
  };

  const handleMarkAttendance = (studentId: string, status: 'present' | 'absent') => {
    const notes = editingNotes[studentId] || '';
    onMarkAttendance(studentId, status, notes);
    setEditingNotes(prev => ({ ...prev, [studentId]: '' }));
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setEditingNotes(prev => ({ ...prev, [studentId]: notes }));
  };

  const presentCount = attendanceRecords.filter(r => r.status === 'present').length;
  const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
  const totalMarked = presentCount + absentCount;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Summary for {new Date(selectedDate).toLocaleDateString()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{presentCount}</div>
              <div className="text-sm text-green-600">Present</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{absentCount}</div>
              <div className="text-sm text-red-600">Absent</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{totalMarked}</div>
              <div className="text-sm text-blue-600">Total Marked</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-gray-600">{students.length}</div>
              <div className="text-sm text-gray-600">Total Students</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search Students</Label>
              <Input
                id="search"
                placeholder="Search by student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Label htmlFor="class-filter">Filter by Class</Label>
              <select
                id="class-filter"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Classes</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Attendance ({filteredStudents.length} students)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="space-y-3">
              {filteredStudents.map(student => {
                const record = getAttendanceRecord(student.id);
                const currentNotes = editingNotes[student.id] || record?.notes || '';
                
                return (
                  <div key={student.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 border rounded-lg bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <h3 className="font-medium text-gray-900 truncate">{student.full_name}</h3>
                        <Badge variant="secondary" className="w-fit">{student.class}</Badge>
                        {record && (
                          <Badge 
                            variant={record.status === 'present' ? 'default' : 'destructive'}
                            className="w-fit"
                          >
                            {record.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{student.contact_number}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={record?.status === 'present' ? 'default' : 'outline'}
                          onClick={() => handleMarkAttendance(student.id, 'present')}
                          className="flex items-center gap-1"
                        >
                          <Check className="h-3 w-3" />
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant={record?.status === 'absent' ? 'destructive' : 'outline'}
                          onClick={() => handleMarkAttendance(student.id, 'absent')}
                          className="flex items-center gap-1"
                        >
                          <X className="h-3 w-3" />
                          Absent
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                              Notes
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add Notes for {student.full_name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                  id="notes"
                                  placeholder="Add any notes about attendance..."
                                  value={currentNotes}
                                  onChange={(e) => handleNotesChange(student.id, e.target.value)}
                                  rows={3}
                                />
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {record?.status === 'absent' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onSendWhatsApp(student.contact_number, student.full_name, selectedDate)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-700"
                          >
                            <MessageCircle className="h-3 w-3" />
                            WhatsApp
                          </Button>
                        )}
                      </div>
                    </div>

                    {record?.notes && (
                      <div className="w-full sm:w-auto mt-2 sm:mt-0">
                        <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded max-w-xs">
                          <strong>Note:</strong> {record.notes}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceSheet;
