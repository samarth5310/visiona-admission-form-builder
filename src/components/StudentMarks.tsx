
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, TrendingUp, TrendingDown, Minus } from 'lucide-react';
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
    if (index === marks.length - 1) return <Minus className="h-4 w-4" />;
    
    const current = (marks[index].marks_obtained / marks[index].total_marks) * 100;
    const previous = (marks[index + 1].marks_obtained / marks[index + 1].total_marks) * 100;
    
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
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
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Your Marks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading marks...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (marks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Your Marks
          </CardTitle>
          <CardDescription>View your test results and performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <GraduationCap className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No marks available yet</p>
            <p className="text-sm text-gray-400">Your test results will appear here once uploaded by the admin</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const groupedMarks = groupMarksBySubject();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Your Marks
          </CardTitle>
          <CardDescription>Your test results and performance overview</CardDescription>
        </CardHeader>
      </Card>

      {/* Recent Marks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {marks.slice(0, 5).map((mark, index) => {
              const percentage = parseFloat(getPercentage(mark.marks_obtained, mark.total_marks));
              return (
                <div key={mark.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{mark.test_name}</h4>
                      {getTrendIcon(marks, index)}
                    </div>
                    <p className="text-sm text-gray-600">{mark.subject}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(mark.test_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">
                        {mark.marks_obtained}/{mark.total_marks}
                      </span>
                      <Badge className={`${getGradeColor(percentage)} text-white`}>
                        {getGrade(percentage)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Subject-wise Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subject-wise Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {Object.entries(groupedMarks).map(([subject, subjectMarks]) => {
              const totalObtained = subjectMarks.reduce((sum, mark) => sum + mark.marks_obtained, 0);
              const totalMaximum = subjectMarks.reduce((sum, mark) => sum + mark.total_marks, 0);
              const averagePercentage = ((totalObtained / totalMaximum) * 100).toFixed(1);
              
              return (
                <div key={subject} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">{subject}</h4>
                    <Badge variant="outline">
                      {subjectMarks.length} test{subjectMarks.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Overall Performance</span>
                    <span className="font-semibold">{averagePercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getGradeColor(parseFloat(averagePercentage))}`}
                      style={{ width: `${Math.min(parseFloat(averagePercentage), 100)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
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
          <CardHeader>
            <CardTitle className="text-lg">Complete Marks History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {marks.slice(5).map((mark) => {
                const percentage = parseFloat(getPercentage(mark.marks_obtained, mark.total_marks));
                return (
                  <div key={mark.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium text-sm">{mark.test_name}</p>
                      <p className="text-xs text-gray-600">{mark.subject}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(mark.test_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
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
