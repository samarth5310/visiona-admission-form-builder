
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink, Calendar, User } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HomeworkItem {
  id: string;
  title: string;
  subject: string;
  description: string;
  google_drive_link: string;
  assigned_by: string;
  assigned_to_class: string;
  assigned_to_students: string[];
  created_at: string;
}

const StudentHomework = () => {
  const [homework, setHomework] = useState<HomeworkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchHomework();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('homework-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'homework'
        },
        () => {
          fetchHomework();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchHomework = async () => {
    try {
      const studentData = localStorage.getItem('visiona_student_data');
      if (!studentData) {
        console.error('No student data found');
        return;
      }

      const student = JSON.parse(studentData);
      console.log('Student data:', student);

      // Fetch all homework
      const { data, error } = await supabase
        .from('homework')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching homework:', error);
        throw error;
      }

      console.log('All homework from database:', data);

      // Filter homework for this student
      const studentHomework = data?.filter(hw => {
        // Check if assigned to student's class
        const isClassAssignment = hw.assigned_to_class === student.class;
        
        // Check if assigned to this specific student
        const isIndividualAssignment = hw.assigned_to_students && 
          Array.isArray(hw.assigned_to_students) && 
          hw.assigned_to_students.includes(student.id);

        console.log('Homework item:', hw.title);
        console.log('Student class:', student.class, 'Assigned to class:', hw.assigned_to_class, 'Match:', isClassAssignment);
        console.log('Student ID:', student.id, 'Assigned to students:', hw.assigned_to_students, 'Individual match:', isIndividualAssignment);
        
        return isClassAssignment || isIndividualAssignment;
      }) || [];

      console.log('Filtered homework for student:', studentHomework);
      setHomework(studentHomework);
    } catch (error) {
      console.error('Error in fetchHomework:', error);
      toast({
        title: "Error",
        description: "Failed to fetch homework assignments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenLink = (link: string) => {
    // Extract file ID from Google Drive link if needed
    let finalLink = link;
    
    // If it's a sharing link, convert to direct view link
    if (link.includes('drive.google.com/file/d/')) {
      const fileId = link.match(/file\/d\/([a-zA-Z0-9_-]+)/)?.[1];
      if (fileId) {
        finalLink = `https://drive.google.com/file/d/${fileId}/view`;
      }
    }
    
    window.open(finalLink, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <BookOpen className="h-5 w-5" />
            Homework Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">Loading homework...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <BookOpen className="h-5 w-5" />
          Homework Assignments
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">Your assigned homework and study materials</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {homework.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-base sm:text-lg">No homework assignments found</p>
            <p className="text-gray-400 text-sm sm:text-base mt-2">Check back later for new assignments</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {homework.map((item) => (
              <Card key={item.id} className="border border-gray-200 hover:border-blue-300 transition-colors">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900 break-words">
                        {item.title}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                          {item.subject}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 sm:h-4 sm:w-4" />
                          {item.assigned_by}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm sm:text-base text-gray-700 break-words mt-2">
                          {item.description}
                        </p>
                      )}
                      
                      <div className="text-xs text-gray-500">
                        <span>
                          Assigned to: {item.assigned_to_class ? `Class ${item.assigned_to_class}` : 'Individual Students'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 sm:w-auto w-full">
                      <Button
                        onClick={() => handleOpenLink(item.google_drive_link)}
                        className="flex items-center gap-2 w-full sm:w-auto"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Open Assignment</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentHomework;
