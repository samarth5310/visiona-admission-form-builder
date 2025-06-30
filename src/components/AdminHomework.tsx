import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Calendar, User, ExternalLink, Trash2, Edit, Plus, Users } from 'lucide-react';
import { Homework } from "@/types/homework";

const AdminHomework = () => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    description: '',
    google_drive_link: '',
    assigned_to_class: '',
    assigned_to_students: [] as string[],
    assignment_type: 'class' as 'class' | 'specific'
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch homework
      const { data: homeworkData, error: homeworkError } = await supabase
        .from('homework')
        .select('*')
        .order('created_at', { ascending: false });

      if (homeworkError) throw homeworkError;
      setHomework(homeworkData || []);

      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('applications')
        .select('id, full_name, class, admission_number')
        .order('full_name');

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

      // Extract unique classes
      const uniqueClasses = [...new Set(studentsData?.map(s => s.class) || [])];
      setClasses(uniqueClasses);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject.trim() || !formData.google_drive_link.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate assignment
    if (formData.assignment_type === 'class' && !formData.assigned_to_class) {
      toast({
        title: "Error",
        description: "Please select a class.",
        variant: "destructive",
      });
      return;
    }

    if (formData.assignment_type === 'specific' && formData.assigned_to_students.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one student.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const homeworkData = {
        title: formData.title.trim(),
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        google_drive_link: formData.google_drive_link.trim(),
        assigned_by: 'Admin', // You can make this dynamic later
        assigned_to_class: formData.assignment_type === 'class' ? formData.assigned_to_class : null,
        assigned_to_students: formData.assignment_type === 'specific' ? formData.assigned_to_students : null
      };

      if (editingHomework) {
        const { error } = await supabase
          .from('homework')
          .update(homeworkData)
          .eq('id', editingHomework.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Homework updated successfully!",
        });
      } else {
        const { error } = await supabase
          .from('homework')
          .insert([homeworkData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Homework assigned successfully!",
        });
      }

      // Reset form and refresh data
      setFormData({
        title: '',
        subject: '',
        description: '',
        google_drive_link: '',
        assigned_to_class: '',
        assigned_to_students: [],
        assignment_type: 'class'
      });
      setEditingHomework(null);
      setShowForm(false);
      fetchData();

    } catch (error) {
      console.error('Error saving homework:', error);
      toast({
        title: "Error",
        description: "Failed to save homework. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (hw: Homework) => {
    setEditingHomework(hw);
    setFormData({
      title: hw.title,
      subject: hw.subject,
      description: hw.description || '',
      google_drive_link: hw.google_drive_link,
      assigned_to_class: hw.assigned_to_class || '',
      assigned_to_students: hw.assigned_to_students || [],
      assignment_type: hw.assigned_to_class ? 'class' : 'specific'
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('homework')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Homework deleted successfully!",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting homework:', error);
      toast({
        title: "Error",
        description: "Failed to delete homework. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStudentNames = (studentIds: string[]) => {
    return studentIds.map(id => {
      const student = students.find(s => s.id === id);
      return student ? student.full_name : 'Unknown';
    }).join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading homework...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header with responsive design */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Homework Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Create and manage student assignments</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Add New Homework
        </Button>
      </div>

      {/* Assignment Form */}
      {showForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <BookOpen className="h-5 w-5" />
              {editingHomework ? 'Edit Homework' : 'Create New Homework'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Math Practice Set 1"
                    required
                    className="text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    placeholder="e.g., Mathematics"
                    required
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Additional instructions or notes (optional)"
                  rows={3}
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="google_drive_link">Google Drive Link *</Label>
                <Input
                  id="google_drive_link"
                  value={formData.google_drive_link}
                  onChange={(e) => setFormData({...formData, google_drive_link: e.target.value})}
                  placeholder="https://drive.google.com/file/d/..."
                  required
                  className="text-sm sm:text-base"
                />
              </div>

              {/* Assignment Type */}
              <div className="space-y-4">
                <Label>Assignment Type</Label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="assignment_type"
                      value="class"
                      checked={formData.assignment_type === 'class'}
                      onChange={(e) => setFormData({...formData, assignment_type: e.target.value as 'class' | 'specific'})}
                      className="text-blue-600"
                    />
                    <span className="text-sm sm:text-base">Assign to entire class</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="assignment_type"
                      value="specific"
                      checked={formData.assignment_type === 'specific'}
                      onChange={(e) => setFormData({...formData, assignment_type: e.target.value as 'class' | 'specific'})}
                      className="text-blue-600"
                    />
                    <span className="text-sm sm:text-base">Assign to specific students</span>
                  </label>
                </div>
              </div>

              {/* Class Selection */}
              {formData.assignment_type === 'class' && (
                <div className="space-y-2">
                  <Label>Select Class *</Label>
                  <Select 
                    value={formData.assigned_to_class} 
                    onValueChange={(value) => setFormData({...formData, assigned_to_class: value})}
                  >
                    <SelectTrigger className="text-sm sm:text-base">
                      <SelectValue placeholder="Choose a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Student Selection */}
              {formData.assignment_type === 'specific' && (
                <div className="space-y-2">
                  <Label>Select Students *</Label>
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                    {students.length === 0 ? (
                      <p className="text-gray-500 text-sm">No students available</p>
                    ) : (
                      <div className="space-y-2">
                        {students.map((student) => (
                          <label key={student.id} className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.assigned_to_students.includes(student.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    assigned_to_students: [...formData.assigned_to_students, student.id]
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    assigned_to_students: formData.assigned_to_students.filter(id => id !== student.id)
                                  });
                                }
                              }}
                              className="text-blue-600"
                            />
                            <span className="text-sm">
                              {student.full_name} ({student.class}) - {student.admission_number}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {formData.assigned_to_students.length > 0 && (
                    <p className="text-sm text-gray-600">
                      Selected: {formData.assigned_to_students.length} student(s)
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none"
                >
                  {isSubmitting ? 'Saving...' : (editingHomework ? 'Update Homework' : 'Create Homework')}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowForm(false);
                    setEditingHomework(null);
                    setFormData({
                      title: '',
                      subject: '',
                      description: '',
                      google_drive_link: '',
                      assigned_to_class: '',
                      assigned_to_students: [],
                      assignment_type: 'class'
                    });
                  }}
                  className="flex-1 sm:flex-none"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Homework List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {homework.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Homework Created</h3>
                <p className="text-gray-600 mb-4">Start by creating your first homework assignment.</p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Homework
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          homework.map((hw) => (
            <Card key={hw.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base sm:text-lg line-clamp-2">{hw.title}</CardTitle>
                  <Badge variant="secondary" className="ml-2 text-xs shrink-0">
                    {hw.subject}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {hw.description && (
                  <p className="text-sm text-gray-600 line-clamp-3">{hw.description}</p>
                )}
                
                <div className="space-y-2 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1 shrink-0" />
                    <span className="truncate">By: {hw.assigned_by}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1 shrink-0" />
                    <span className="truncate">{formatDate(hw.created_at)}</span>
                  </div>
                  
                  <div className="flex items-start">
                    <Users className="h-3 w-3 mr-1 mt-0.5 shrink-0" />
                    <span className="text-xs line-clamp-2">
                      {hw.assigned_to_class 
                        ? `Class: ${hw.assigned_to_class}` 
                        : `Students: ${getStudentNames(hw.assigned_to_students || [])}`
                      }
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(hw.google_drive_link, '_blank')}
                    className="flex items-center gap-1 text-xs flex-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View Document
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(hw)}
                      className="flex items-center gap-1 text-xs"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-sm sm:max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-base sm:text-lg">Delete Homework</AlertDialogTitle>
                          <AlertDialogDescription className="text-sm">
                            Are you sure you want to delete "{hw.title}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                          <AlertDialogCancel className="w-full sm:w-auto">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(hw.id)}
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminHomework;
