import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Plus, Search, MessageCircle, Edit, Trash2, Users, User } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import WhatsAppMessaging from './WhatsAppMessaging';
import type { StudentMark } from '@/types/marks';

interface Student {
  id: string;
  full_name: string;
  class: string;
  contact_number: string;
}

const MarksManagement = () => {
  const [marks, setMarks] = useState<StudentMark[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMark, setEditingMark] = useState<StudentMark | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [whatsappData, setWhatsappData] = useState<any>(null);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [selectedEntryType, setSelectedEntryType] = useState<'individual' | 'bulk'>('individual');

  // Form states
  const [formData, setFormData] = useState({
    student_id: '',
    test_name: '',
    subject: '',
    marks_obtained: '',
    total_marks: '',
    test_date: new Date().toISOString().split('T')[0]
  });

  // Bulk entry states
  const [bulkData, setBulkData] = useState({
    test_name: '',
    subject: '',
    total_marks: '',
    test_date: new Date().toISOString().split('T')[0],
    class_filter: 'all'
  });

  const [bulkMarks, setBulkMarks] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [marksResponse, studentsResponse] = await Promise.all([
        supabase.from('student_marks').select('*').order('created_at', { ascending: false }),
        supabase.from('applications').select('id, full_name, class, contact_number').order('full_name')
      ]);

      if (marksResponse.error) throw marksResponse.error;
      if (studentsResponse.error) throw studentsResponse.error;

      setMarks(marksResponse.data || []);
      setStudents(studentsResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const markData = {
        student_id: formData.student_id,
        test_name: formData.test_name,
        subject: formData.subject,
        marks_obtained: parseInt(formData.marks_obtained),
        total_marks: parseInt(formData.total_marks),
        test_date: formData.test_date
      };

      let response;
      if (editingMark) {
        response = await supabase
          .from('student_marks')
          .update(markData)
          .eq('id', editingMark.id);
      } else {
        response = await supabase
          .from('student_marks')
          .insert([markData]);
      }

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: editingMark ? "Mark updated successfully" : "Mark added successfully",
      });

      resetForm();
      fetchData();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving mark:', error);
      toast({
        title: "Error",
        description: "Failed to save mark",
        variant: "destructive",
      });
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const filteredStudents = students.filter(student =>
        bulkData.class_filter === 'all' || student.class === bulkData.class_filter
      );

      const marksToInsert = filteredStudents
        .filter(student => bulkMarks[student.id] && bulkMarks[student.id].trim() !== '')
        .map(student => ({
          student_id: student.id,
          test_name: bulkData.test_name,
          subject: bulkData.subject,
          marks_obtained: parseInt(bulkMarks[student.id]),
          total_marks: parseInt(bulkData.total_marks),
          test_date: bulkData.test_date
        }));

      if (marksToInsert.length === 0) {
        toast({
          title: "Error",
          description: "Please enter marks for at least one student",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('student_marks')
        .insert(marksToInsert);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Marks added for ${marksToInsert.length} students`,
      });

      resetBulkForm();
      fetchData();
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving bulk marks:', error);
      toast({
        title: "Error",
        description: "Failed to save marks",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (mark: StudentMark) => {
    setEditingMark(mark);
    setFormData({
      student_id: mark.student_id,
      test_name: mark.test_name,
      subject: mark.subject,
      marks_obtained: mark.marks_obtained.toString(),
      total_marks: mark.total_marks.toString(),
      test_date: mark.test_date
    });
    setSelectedEntryType('individual');
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this mark?')) return;

    try {
      const { error } = await supabase
        .from('student_marks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Mark deleted successfully",
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting mark:', error);
      toast({
        title: "Error",
        description: "Failed to delete mark",
        variant: "destructive",
      });
    }
  };

  const handleWhatsApp = (mark: StudentMark) => {
    const student = students.find(s => s.id === mark.student_id);
    if (!student) return;

    setWhatsappData({
      studentName: student.full_name,
      amountPaid: 0,
      paymentDate: new Date().toISOString(),
      paymentType: "General Communication",
      dueAmount: 0,
      phoneNumber: student.contact_number
    });
    setShowWhatsApp(true);
  };

  const resetForm = () => {
    setFormData({
      student_id: '',
      test_name: '',
      subject: '',
      marks_obtained: '',
      total_marks: '',
      test_date: new Date().toISOString().split('T')[0]
    });
    setEditingMark(null);
  };

  const resetBulkForm = () => {
    setBulkData({
      test_name: '',
      subject: '',
      total_marks: '',
      test_date: new Date().toISOString().split('T')[0],
      class_filter: 'all'
    });
    setBulkMarks({});
  };

  const filteredMarks = marks.filter(mark => {
    const student = students.find(s => s.id === mark.student_id);
    const query = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm ||
      ((student?.full_name || '').toLowerCase().includes(query)) ||
      ((mark.test_name || '').toLowerCase().includes(query)) ||
      ((mark.subject || '').toLowerCase().includes(query));

    const matchesSubject = filterSubject === 'all' || mark.subject === filterSubject;
    const matchesClass = filterClass === 'all' || (student && student.class === filterClass);

    return matchesSearch && matchesSubject && matchesClass;
  });

  const getUniqueValues = (key: keyof StudentMark | 'class') => {
    if (key === 'class') {
      return [...new Set(students.map(s => s.class))];
    }
    return [...new Set(marks.map(mark => String(mark[key as keyof StudentMark])))];
  };

  const getBulkStudents = () => {
    return students.filter(student =>
      bulkData.class_filter === 'all' || student.class === bulkData.class_filter
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marks data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">Marks Management</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Manage student test scores and performance</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            resetBulkForm();
            setShowAddForm(true);
          }}
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Marks
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Filter & Search</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm dark:text-gray-300">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students or tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm dark:text-gray-300">Subject</Label>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {getUniqueValues('subject').map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label className="text-xs sm:text-sm dark:text-gray-300">Class</Label>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {getUniqueValues('class').map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setFilterSubject('all');
                  setFilterClass('all');
                }}
                className="w-full text-sm"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marks Table */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Student Marks ({filteredMarks.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {/* Mobile Card View */}
          <div className="sm:hidden space-y-3 p-4">
            {filteredMarks.map((mark) => {
              const student = students.find(s => s.id === mark.student_id);
              const percentage = ((mark.marks_obtained / mark.total_marks) * 100).toFixed(1);

              return (
                <Card key={mark.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate dark:text-white">{student?.full_name}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{student?.class}</p>
                    </div>
                    <Badge variant="outline" className="text-xs ml-2">
                      {mark.subject}
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Test:</span>
                      <span className="font-medium dark:text-gray-200">{mark.test_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Score:</span>
                      <span className="font-medium dark:text-gray-200">{mark.marks_obtained}/{mark.total_marks} ({percentage}%)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Date:</span>
                      <span className="dark:text-gray-200">{new Date(mark.test_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(mark)} className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleWhatsApp(mark)} className="flex-1">
                      <MessageCircle className="h-3 w-3 mr-1" />
                      WhatsApp
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(mark.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs sm:text-sm">Student</TableHead>
                  <TableHead className="text-xs sm:text-sm">Class</TableHead>
                  <TableHead className="text-xs sm:text-sm">Test</TableHead>
                  <TableHead className="text-xs sm:text-sm">Subject</TableHead>
                  <TableHead className="text-xs sm:text-sm">Marks</TableHead>
                  <TableHead className="text-xs sm:text-sm">Percentage</TableHead>
                  <TableHead className="text-xs sm:text-sm">Date</TableHead>
                  <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMarks.map((mark) => {
                  const student = students.find(s => s.id === mark.student_id);
                  const percentage = ((mark.marks_obtained / mark.total_marks) * 100).toFixed(1);

                  return (
                    <TableRow key={mark.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <TableCell className="font-medium text-xs sm:text-sm dark:text-gray-200">
                        {student?.full_name || 'Unknown Student'}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge variant="outline" className="text-xs">
                          {student?.class}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm dark:text-gray-300">{mark.test_name}</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge variant="secondary" className="text-xs">
                          {mark.subject}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm font-medium dark:text-gray-200">
                        {mark.marks_obtained}/{mark.total_marks}
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <Badge
                          className={`text-xs ${parseFloat(percentage) >= 80 ? 'bg-green-500' :
                            parseFloat(percentage) >= 60 ? 'bg-blue-500' :
                              parseFloat(percentage) >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            } text-white`}
                        >
                          {percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm dark:text-gray-300">
                        {new Date(mark.test_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 sm:gap-2">
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(mark)}>
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleWhatsApp(mark)}>
                            <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDelete(mark.id)}>
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredMarks.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm sm:text-base">No marks found</p>
                <p className="text-xs sm:text-sm text-gray-400">Add some marks or adjust your filters</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Form Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] sm:max-w-2xl max-h-[88svh] overflow-y-auto rounded-2xl p-4 sm:p-6 dark:bg-gray-900 dark:border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl dark:text-white">
              {editingMark ? 'Edit Mark' : 'Add Marks'}
            </DialogTitle>
            <DialogDescription className="sr-only dark:text-gray-400">
              Form to add or edit student marks
            </DialogDescription>
          </DialogHeader>

          <Tabs value={selectedEntryType} onValueChange={(v) => setSelectedEntryType(v as 'individual' | 'bulk')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 dark:bg-gray-800">
              <TabsTrigger value="individual" className="flex items-center gap-2 text-xs sm:text-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white">
                <User className="h-4 w-4" />
                Individual
              </TabsTrigger>
              <TabsTrigger value="bulk" className="flex items-center gap-2 text-xs sm:text-sm dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-white" disabled={!!editingMark}>
                <Users className="h-4 w-4" />
                Bulk Entry
              </TabsTrigger>
            </TabsList>

            <TabsContent value="individual">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm dark:text-gray-300">Student</Label>
                    <Select value={formData.student_id} onValueChange={(value) => setFormData({ ...formData, student_id: value })}>
                      <SelectTrigger className="text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100">
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        {students.map(student => (
                          <SelectItem key={student.id} value={student.id} className="text-sm dark:text-gray-100 dark:focus:bg-gray-800">
                            {student.full_name} ({student.class})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm dark:text-gray-300">Test Name</Label>
                    <Input
                      value={formData.test_name}
                      onChange={(e) => setFormData({ ...formData, test_name: e.target.value })}
                      placeholder="Unit Test 1, Mid-term, etc."
                      required
                      className="text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm dark:text-gray-300">Subject</Label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Mathematics, Science, etc."
                      required
                      className="text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm dark:text-gray-300">Test Date</Label>
                    <Input
                      type="date"
                      value={formData.test_date}
                      onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
                      required
                      className="text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 [color-scheme:dark]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm dark:text-gray-300">Marks Obtained</Label>
                    <Input
                      type="number"
                      value={formData.marks_obtained}
                      onChange={(e) => setFormData({ ...formData, marks_obtained: e.target.value })}
                      placeholder="85"
                      required
                      min="0"
                      className="text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm dark:text-gray-300">Total Marks</Label>
                    <Input
                      type="number"
                      value={formData.total_marks}
                      onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                      placeholder="100"
                      required
                      min="1"
                      className="text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingMark ? 'Update Mark' : 'Add Mark'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="flex-1 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                    Cancel
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="bulk">
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm dark:text-gray-300">Test Name</Label>
                    <Input
                      value={bulkData.test_name}
                      onChange={(e) => setBulkData({ ...bulkData, test_name: e.target.value })}
                      placeholder="Unit Test 1, Mid-term, etc."
                      required
                      className="text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm dark:text-gray-300">Subject</Label>
                    <Input
                      value={bulkData.subject}
                      onChange={(e) => setBulkData({ ...bulkData, subject: e.target.value })}
                      placeholder="Mathematics, Science, etc."
                      required
                      className="text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm dark:text-gray-300">Total Marks</Label>
                    <Input
                      type="number"
                      value={bulkData.total_marks}
                      onChange={(e) => setBulkData({ ...bulkData, total_marks: e.target.value })}
                      placeholder="100"
                      required
                      min="1"
                      className="text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm dark:text-gray-300">Test Date</Label>
                    <Input
                      type="date"
                      value={bulkData.test_date}
                      onChange={(e) => setBulkData({ ...bulkData, test_date: e.target.value })}
                      required
                      className="text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 [color-scheme:dark]"
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label className="text-sm dark:text-gray-300">Filter by Class (Optional)</Label>
                    <Select value={bulkData.class_filter} onValueChange={(value) => setBulkData({ ...bulkData, class_filter: value })}>
                      <SelectTrigger className="text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100">
                        <SelectValue placeholder="All classes" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-900 dark:border-gray-700">
                        <SelectItem value="all" className="dark:text-gray-100 dark:focus:bg-gray-800">All classes</SelectItem>
                        {getUniqueValues('class').map(cls => (
                          <SelectItem key={cls} value={cls} className="dark:text-gray-100 dark:focus:bg-gray-800">{cls}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium dark:text-gray-300">Enter Marks for Students</Label>
                  <div className="max-h-60 overflow-y-auto border rounded-lg p-2 space-y-2 dark:border-gray-700">
                    {getBulkStudents().map(student => (
                      <div key={student.id} className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 border rounded dark:border-gray-700">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate dark:text-gray-200">{student.full_name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{student.class}</p>
                        </div>
                        <div className="w-full sm:w-24">
                          <Input
                            type="number"
                            placeholder="Marks"
                            value={bulkMarks[student.id] || ''}
                            onChange={(e) => setBulkMarks({ ...bulkMarks, [student.id]: e.target.value })}
                            min="0"
                            max={bulkData.total_marks}
                            className="text-sm dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button type="submit" className="flex-1">
                    Add Marks for Selected Students
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="flex-1 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800">
                    Cancel
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* WhatsApp Integration */}
      {whatsappData && (
        <WhatsAppMessaging
          {...whatsappData}
          isOpen={showWhatsApp}
          onClose={() => setShowWhatsApp(false)}
        />
      )}
    </div>
  );
};

export default MarksManagement;