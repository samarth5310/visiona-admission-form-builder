
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, BookOpen, Calendar, User, ExternalLink } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Homework, HomeworkFormData } from "@/types/homework";

const AdminHomework = () => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<HomeworkFormData>({
    title: '',
    subject: '',
    description: '',
    google_drive_link: '',
    assigned_to_class: '',
    assigned_to_students: []
  });

  const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Hindi', 'Physics', 'Chemistry', 'Biology'];
  const classes = ['6th', '7th', '8th', '9th', '10th', '11th', '12th'];

  useEffect(() => {
    fetchHomework();
    fetchStudents();
  }, []);

  const fetchHomework = async () => {
    try {
      const { data, error } = await supabase
        .from('homework')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHomework(data || []);
    } catch (error) {
      console.error('Error fetching homework:', error);
      toast({
        title: "Error",
        description: "Failed to fetch homework assignments.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('full_name, class')
        .order('class', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subject: '',
      description: '',
      google_drive_link: '',
      assigned_to_class: '',
      assigned_to_students: []
    });
    setEditingHomework(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.subject.trim() || !formData.google_drive_link.trim() || !formData.assigned_to_class.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const homeworkData = {
        ...formData,
        assigned_by: 'Admin', // You can get this from auth context if available
      };

      if (editingHomework) {
        const { error } = await supabase
          .from('homework')
          .update(homeworkData)
          .eq('id', editingHomework.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Homework updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from('homework')
          .insert([homeworkData]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Homework assigned successfully.",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchHomework();
    } catch (error) {
      console.error('Error saving homework:', error);
      toast({
        title: "Error",
        description: "Failed to save homework assignment.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (hw: Homework) => {
    setEditingHomework(hw);
    setFormData({
      title: hw.title,
      subject: hw.subject,
      description: hw.description || '',
      google_drive_link: hw.google_drive_link,
      assigned_to_class: hw.assigned_to_class,
      assigned_to_students: hw.assigned_to_students
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this homework assignment?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('homework')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Homework deleted successfully.",
      });

      fetchHomework();
      if (selectedHomework?.id === id) {
        setSelectedHomework(null);
      }
    } catch (error) {
      console.error('Error deleting homework:', error);
      toast({
        title: "Error",
        description: "Failed to delete homework assignment.",
        variant: "destructive",
      });
    }
  };

  const getStudentsByClass = (className: string) => {
    return students.filter(student => student.class === className);
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

  const getEmbedUrl = (driveLink: string) => {
    const patterns = [
      /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
      /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/
    ];
    
    for (const pattern of patterns) {
      const match = driveLink.match(pattern);
      if (match) return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    
    if (/^[a-zA-Z0-9_-]+$/.test(driveLink)) {
      return `https://drive.google.com/file/d/${driveLink}/preview`;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading homework management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Manage Homework</h1>
          <p className="text-gray-600">Create and manage homework assignments for students</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Add Homework
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingHomework ? 'Edit Homework' : 'Add New Homework'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter homework title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData({...formData, subject: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="google_drive_link">Google Drive Link *</Label>
                <Input
                  id="google_drive_link"
                  value={formData.google_drive_link}
                  onChange={(e) => setFormData({...formData, google_drive_link: e.target.value})}
                  placeholder="Paste Google Drive share link"
                  required
                />
              </div>

              <div>
                <Label htmlFor="class">Assign to Class *</Label>
                <Select
                  value={formData.assigned_to_class}
                  onValueChange={(value) => setFormData({...formData, assigned_to_class: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
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

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingHomework ? 'Update' : 'Create'} Homework
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Homework List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Homework Assignments ({homework.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {homework.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No homework assignments yet.</p>
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto">
                  {homework.map((hw) => (
                    <div
                      key={hw.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedHomework?.id === hw.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                      onClick={() => setSelectedHomework(hw)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm">{hw.title}</h3>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(hw);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(hw.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Badge variant="secondary" className="text-xs">
                          {hw.subject}
                        </Badge>
                        <p className="text-xs text-gray-600">Class: {hw.assigned_to_class}</p>
                        <p className="text-xs text-gray-600">{formatDate(hw.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-2">
          {selectedHomework ? (
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      {selectedHomework.title}
                    </CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <Badge variant="outline">{selectedHomework.subject}</Badge>
                      <span>Class: {selectedHomework.assigned_to_class}</span>
                      <span>{formatDate(selectedHomework.created_at)}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedHomework.google_drive_link, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open in Drive
                  </Button>
                </div>
                
                {selectedHomework.description && (
                  <p className="text-gray-600 mt-2">{selectedHomework.description}</p>
                )}
              </CardHeader>
              
              <CardContent className="flex-1">
                <div className="h-[600px] border rounded-lg overflow-hidden">
                  {getEmbedUrl(selectedHomework.google_drive_link) ? (
                    <iframe
                      src={getEmbedUrl(selectedHomework.google_drive_link)!}
                      className="w-full h-full"
                      frameBorder="0"
                      title={selectedHomework.title}
                      allow="autoplay"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-50">
                      <div className="text-center">
                        <ExternalLink className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Preview Not Available</h3>
                        <p className="text-gray-600 mb-4">Unable to preview this document format.</p>
                        <Button
                          onClick={() => window.open(selectedHomework.google_drive_link, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open in Google Drive
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full">
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select Homework</h3>
                  <p className="text-gray-600">Choose a homework assignment to preview the document.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHomework;
