
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import type { Homework, HomeworkFormData } from '@/types/homework';

interface Student {
  id: string;
  full_name: string;
  class: string;
}

const AdminHomework = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [assignmentType, setAssignmentType] = useState<'class' | 'individual'>('class');
  const [formData, setFormData] = useState<HomeworkFormData>({
    title: '',
    subject: '',
    description: '',
    google_drive_link: '',
    assigned_to_class: '',
    assigned_to_students: []
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch homework
  const { data: homework = [], isLoading } = useQuery({
    queryKey: ['homework'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homework')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Homework[];
    }
  });

  // Fetch students and classes
  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('id, full_name, class')
        .order('full_name');
      
      if (error) throw error;
      return data as Student[];
    }
  });

  // Get unique classes
  const classes = [...new Set(students.map(s => s.class))].sort();

  // Create homework mutation
  const createHomework = useMutation({
    mutationFn: async (data: HomeworkFormData) => {
      const { error } = await supabase
        .from('homework')
        .insert([{
          ...data,
          assigned_by: 'Admin' // This should be the actual admin name
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
      resetForm();
      toast({
        title: "Success",
        description: "Homework created successfully!"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create homework. Please try again.",
        variant: "destructive"
      });
      console.error('Error creating homework:', error);
    }
  });

  // Update homework mutation
  const updateHomework = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: HomeworkFormData }) => {
      const { error } = await supabase
        .from('homework')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
      setEditingId(null);
      resetForm();
      toast({
        title: "Success",
        description: "Homework updated successfully!"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update homework. Please try again.",
        variant: "destructive"
      });
      console.error('Error updating homework:', error);
    }
  });

  // Delete homework mutation
  const deleteHomework = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('homework')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
      toast({
        title: "Success",
        description: "Homework deleted successfully!"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete homework. Please try again.",
        variant: "destructive"
      });
      console.error('Error deleting homework:', error);
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      subject: '',
      description: '',
      google_drive_link: '',
      assigned_to_class: '',
      assigned_to_students: []
    });
    setIsCreating(false);
    setEditingId(null);
    setAssignmentType('class');
  };

  const handleEdit = (hw: Homework) => {
    setFormData({
      title: hw.title,
      subject: hw.subject,
      description: hw.description || '',
      google_drive_link: hw.google_drive_link,
      assigned_to_class: hw.assigned_to_class,
      assigned_to_students: hw.assigned_to_students || []
    });
    setAssignmentType(hw.assigned_to_students && hw.assigned_to_students.length > 0 ? 'individual' : 'class');
    setEditingId(hw.id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.subject || !formData.google_drive_link) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const submitData = {
      ...formData,
      assigned_to_class: assignmentType === 'class' ? formData.assigned_to_class : '',
      assigned_to_students: assignmentType === 'individual' ? formData.assigned_to_students : []
    };

    if (editingId) {
      updateHomework.mutate({ id: editingId, data: submitData });
    } else {
      createHomework.mutate(submitData);
    }
  };

  const handleStudentSelection = (studentId: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        assigned_to_students: [...prev.assigned_to_students, studentId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        assigned_to_students: prev.assigned_to_students.filter(id => id !== studentId)
      }));
    }
  };

  const getStudentNames = (studentIds: string[]) => {
    return studentIds.map(id => {
      const student = students.find(s => s.id === id);
      return student?.full_name || 'Unknown';
    }).join(', ');
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading homework...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {editingId ? 'Edit Homework' : 'Create New Homework'}
              <Button variant="ghost" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter homework title"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter subject name"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter homework description (optional)"
                />
              </div>

              <div>
                <Label htmlFor="google_drive_link">Google Drive Link *</Label>
                <Input
                  id="google_drive_link"
                  value={formData.google_drive_link}
                  onChange={(e) => setFormData(prev => ({ ...prev, google_drive_link: e.target.value }))}
                  placeholder="Enter Google Drive share link"
                  required
                />
              </div>

              <div>
                <Label>Assignment Type</Label>
                <RadioGroup value={assignmentType} onValueChange={(value: 'class' | 'individual') => setAssignmentType(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="class" id="class" />
                    <Label htmlFor="class">Assign to entire class</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="individual" id="individual" />
                    <Label htmlFor="individual">Assign to specific students</Label>
                  </div>
                </RadioGroup>
              </div>

              {assignmentType === 'class' && (
                <div>
                  <Label htmlFor="assigned_to_class">Select Class</Label>
                  <Select value={formData.assigned_to_class} onValueChange={(value) => setFormData(prev => ({ ...prev, assigned_to_class: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((className) => (
                        <SelectItem key={className} value={className}>
                          {className}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {assignmentType === 'individual' && (
                <div>
                  <Label>Select Students</Label>
                  <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-2">
                    {students.map((student) => (
                      <div key={student.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={student.id}
                          checked={formData.assigned_to_students.includes(student.id)}
                          onCheckedChange={(checked) => handleStudentSelection(student.id, checked as boolean)}
                        />
                        <Label htmlFor={student.id} className="text-sm">
                          {student.full_name} ({student.class})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createHomework.isPending || updateHomework.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? 'Update' : 'Create'} Homework
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Homework</h2>
        {!isCreating && !editingId && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Homework
          </Button>
        )}
      </div>

      {/* Homework List */}
      <div className="grid gap-4">
        {homework.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">No homework assignments found.</p>
            </CardContent>
          </Card>
        ) : (
          homework.map((hw) => (
            <Card key={hw.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{hw.title}</h3>
                    <p className="text-gray-600 mb-2">Subject: {hw.subject}</p>
                    {hw.description && (
                      <p className="text-gray-700 mb-2">{hw.description}</p>
                    )}
                    <div className="text-sm text-gray-500">
                      <p>Assigned by: {hw.assigned_by}</p>
                      <p>Created: {new Date(hw.created_at).toLocaleDateString()}</p>
                      {hw.assigned_to_class && <p>Class: {hw.assigned_to_class}</p>}
                      {hw.assigned_to_students && hw.assigned_to_students.length > 0 && (
                        <p>Students: {getStudentNames(hw.assigned_to_students)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(hw)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onclick={() => deleteHomework.mutate(hw.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
