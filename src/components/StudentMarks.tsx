
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Calendar, Trophy } from 'lucide-react';
import type { StudentMark } from '@/types/marks';

interface StudentMarksProps {
  studentId: string;
}

const StudentMarks: React.FC<StudentMarksProps> = ({ studentId }) => {
  // Fetch marks with real-time updates
  const { data: marks = [], isLoading } = useQuery({
    queryKey: ['student-marks', studentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_marks')
        .select('*')
        .eq('student_id', studentId)
        .order('test_date', { ascending: false });
      
      if (error) throw error;
      return data as StudentMark[];
    }
  });

  // Set up real-time subscription
  React.useEffect(() => {
    const channel = supabase
      .channel('student-marks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_marks',
          filter: `student_id=eq.${studentId}`
        },
        () => {
          // Refetch marks when there are changes
          window.location.reload(); // Simple approach, could be optimized
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [studentId]);

  const calculatePercentage = (obtained: number, total: number) => {
    return ((obtained / total) * 100).toFixed(1);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 75) return 'bg-blue-100 text-blue-800';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 35) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 75) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 35) return 'C';
    return 'F';
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading marks...</p>
      </div>
    );
  }

  if (marks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No marks available yet.</p>
          <p className="text-sm text-gray-400 mt-2">Your test results will appear here once uploaded by the admin.</p>
        </CardContent>
      </Card>
    );
  }

  // Group marks by test
  const groupedMarks = marks.reduce((acc, mark) => {
    const key = `${mark.test_name}_${mark.test_date}`;
    if (!acc[key]) {
      acc[key] = {
        test_name: mark.test_name,
        test_date: mark.test_date,
        subjects: []
      };
    }
    acc[key].subjects.push(mark);
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Test Results</h3>
      </div>

      {Object.values(groupedMarks).map((test: any) => {
        const totalMarks = test.subjects.reduce((sum: number, subject: StudentMark) => sum + subject.total_marks, 0);
        const obtainedMarks = test.subjects.reduce((sum: number, subject: StudentMark) => sum + subject.marks_obtained, 0);
        const overallPercentage = parseFloat(calculatePercentage(obtainedMarks, totalMarks));

        return (
          <Card key={`${test.test_name}_${test.test_date}`} className="overflow-hidden">
            <CardHeader className="bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{test.test_name}</CardTitle>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(test.test_date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{obtainedMarks}/{totalMarks}</div>
                  <Badge className={`${getGradeColor(overallPercentage)} mt-1`}>
                    {getGrade(overallPercentage)} ({overallPercentage}%)
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {test.subjects.map((subject: StudentMark) => {
                  const percentage = parseFloat(calculatePercentage(subject.marks_obtained, subject.total_marks));
                  return (
                    <div key={subject.id} className="p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{subject.subject}</h4>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {subject.marks_obtained}/{subject.total_marks}
                        </div>
                        <Badge className={`${getGradeColor(percentage)} text-xs`}>
                          {percentage}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StudentMarks;
