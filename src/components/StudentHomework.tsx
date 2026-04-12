import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink, Calendar, User, FileText } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { safeStorage } from '@/utils/safeStorage';

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
    let mounted = true;

    fetchHomework();

    // Use random channel ID to ensure uniqueness and prevent "subscribe multiple times" error
    const channelId = Math.random().toString(36).substring(7);
    const channel = supabase
      .channel(`homework-changes-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'homework'
        },
        () => {
          if (mounted) fetchHomework();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      // Immediate cleanup is better to prevent lingering subscriptions
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchHomework = async () => {
    try {
      const studentData = safeStorage.getItem('visiona_student_data');
      if (!studentData) {
        console.error('No student data found');
        return;
      }

      const student = JSON.parse(studentData);

      // Fetch all homework
      const { data, error } = await supabase
        .from('homework')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching homework:', error);
        throw error;
      }

      // Filter homework for this student
      const studentHomework = data?.filter(hw => {
        // Check if assigned to student's class
        const isClassAssignment = hw.assigned_to_class === student.class;

        // Check if assigned to this specific student
        const isIndividualAssignment = hw.assigned_to_students &&
          Array.isArray(hw.assigned_to_students) &&
          hw.assigned_to_students.includes(student.id);

        return isClassAssignment || isIndividualAssignment;
      }) || [];

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

  const handleOpenLink = (link: string | null | undefined) => {
    if (!link || typeof link !== 'string') {
      toast({
        title: "Invalid Link",
        description: "This homework does not have a valid Google Drive link.",
        variant: "destructive",
      });
      return;
    }

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
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Homework Assignments</h2>
          <p className="text-gray-500 dark:text-gray-400">View and submit your assignments</p>
        </div>
      </div>

      {homework.length === 0 ? (
        <Card className="border-dashed border-2 bg-gray-50 dark:bg-white/5 dark:border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Assignments Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mt-2">
              You're all caught up! Check back later for new homework assignments.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {homework.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white dark:bg-[#0B1121] dark:text-white overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                    {item.subject}
                  </span>
                </div>

                <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-blue-500 transition-colors">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 h-10">
                  {item.description || "No description provided."}
                </p>

                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-6">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{item.assigned_by}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleOpenLink(item.google_drive_link)}
                  className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Assignment
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentHomework;
