
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, TrendingUp, TrendingDown, Minus, ChevronRight } from 'lucide-react';
import type { StudentMark } from '@/types/marks';

const StudentMarks = () => {
  const [marks, setMarks] = useState<StudentMark[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentMarks();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('student-marks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_marks'
        },
        () => {
          fetchStudentMarks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStudentMarks = async () => {
    try {
      const studentData = localStorage.getItem('visiona_student_data');
      if (!studentData) return;

      const student = JSON.parse(studentData);
      
      const { data, error } = await supabase
        .from('student_marks')
        .select('*')
        .eq('student_id', student.id)
        .order('test_date', { ascending: false });

      if (error) throw error;

      setMarks(data || []);
    } catch (error) {
      console.error('Error fetching student marks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = (obtained: number, total: number) => {
    return ((obtained / total) * 100).toFixed(1);
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    return 'F';
  };

  const getTrendIcon = (marks: StudentMark[], index: number) => {
    if (index === marks.length - 1) return <Minus className="h-3 w-3 sm:h-4 sm:w-4" />;
    
    const current = (marks[index].marks_obtained / marks[index].total_marks) * 100;
    const previous = (marks[index + 1].marks_obtained / marks[index + 1].total_marks) * 100;
    
    if (current > previous) return <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />;
    return <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />;
  };

  const groupMarksBySubject = () => {
    const grouped: { [key: string]: StudentMark[] } = {};
    marks.forEach(mark => {
      if (!grouped[mark.subject]) {
        grouped[mark.subject] = [];
      }
      grouped[mark.subject].push(mark);
    });
    return grouped;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <GraduationCap className="h-5 w-5" />
            Your Marks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">Loading marks...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (marks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <GraduationCap className="h-5 w-5" />
            Your Marks
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">View your test results and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 sm:py-12">
            <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">No marks available yet</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Your test results will appear here once uploaded by the admin</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const groupedMarks = groupMarksBySubject();

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <GraduationCap className="h-5 w-5" />
            Your Marks
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">Your test results and performance overview</CardDescription>
        </CardHeader>
      </Card>

      {/* Recent Marks */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Recent Test Results</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {marks.slice(0, 5).map((mark, index) => {
              const percentage = parseFloat(getPercentage(mark.marks_obtained, mark.total_marks));
              return (
                <div key={mark.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm sm:text-base truncate">{mark.test_name}</h4>
                      <div className="shrink-0">
                        {getTrendIcon(marks, index)}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 truncate">{mark.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(mark.test_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right ml-4 shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm sm:text-base">
                        {mark.marks_obtained}/{mark.total_marks}
                      </span>
                      <Badge className={`${getGradeColor(percentage)} text-white text-xs`}>
                        {getGrade(percentage)}
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Subject-wise Performance */}
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg">Subject-wise Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            {Object.entries(groupedMarks).map(([subject, subjectMarks]) => {
              const totalObtained = subjectMarks.reduce((sum, mark) => sum + mark.marks_obtained, 0);
              const totalMaximum = subjectMarks.reduce((sum, mark) => sum + mark.total_marks, 0);
              const averagePercentage = ((totalObtained / totalMaximum) * 100).toFixed(1);
              
              return (
                <div key={subject} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 gap-2">
                    <h4 className="font-medium text-sm sm:text-base">{subject}</h4>
                    <Badge variant="outline" className="text-xs w-fit">
                      {subjectMarks.length} test{subjectMarks.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-1">
                    <span className="text-xs sm:text-sm text-gray-600">Overall Performance</span>
                    <span className="font-semibold text-sm sm:text-base">{averagePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getGradeColor(parseFloat(averagePercentage))}`}
                      style={{ width: `${Math.min(parseFloat(averagePercentage), 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500">
                    Total: {totalObtained}/{totalMaximum} marks
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* All Marks History */}
      {marks.length > 5 && (
        <Card>
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg">Complete Marks History</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="space-y-2 sm:space-y-3">
              {marks.slice(5).map((mark) => {
                const percentage = parseFloat(getPercentage(mark.marks_obtained, mark.total_marks));
                return (
                  <div key={mark.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{mark.test_name}</p>
                      <p className="text-xs text-gray-600 truncate">{mark.subject}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(mark.test_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right ml-4 shrink-0">
                      <p className="font-semibold text-xs sm:text-sm">
                        {mark.marks_obtained}/{mark.total_marks}
                      </p>
                      <p className="text-xs text-gray-600">{percentage}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentMarks;
