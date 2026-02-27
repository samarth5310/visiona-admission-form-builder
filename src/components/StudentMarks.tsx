import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { GraduationCap, TrendingUp, TrendingDown, Minus, ChevronRight, BarChart3, Calendar, AlertCircle } from 'lucide-react';
import type { StudentMark } from '@/types/marks';
import { safeStorage } from '@/utils/safeStorage';

const StudentMarks = () => {
  const [marks, setMarks] = useState<StudentMark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    fetchStudentMarks();

    // Use random channel ID to ensure uniqueness
    const channelId = Math.random().toString(36).substring(7);
    const channel = supabase
      .channel(`student-marks-changes-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_marks'
        },
        () => {
          if (mounted) fetchStudentMarks();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStudentMarks = async () => {
    try {
      const studentData = safeStorage.getItem('visiona_student_data');
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
      setError('Failed to load marks');
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
    // Check if next item exists
    if (!marks[index + 1]) return <Minus className="h-4 w-4 text-gray-400" />;

    const currentMark = marks[index];
    const prevMark = marks[index + 1];

    // Avoid division by zero
    if (currentMark.total_marks === 0 || prevMark.total_marks === 0)
      return <Minus className="h-4 w-4 text-gray-400" />;

    const current = (currentMark.marks_obtained / currentMark.total_marks) * 100;
    const previous = (prevMark.marks_obtained / prevMark.total_marks) * 100;

    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
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
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-dashed border-2 bg-gray-50 dark:bg-white/5 dark:border-white/10">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Error Loading Marks</h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mt-2">
            {error}. Please try refreshing the page.
          </p>
        </CardContent>
      </Card>
    );
  }

  const groupedMarks = groupMarksBySubject();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Academic Performance</h2>
          <p className="text-gray-500 dark:text-gray-400">Track your progress and test results</p>
        </div>
      </div>

      {marks.length === 0 ? (
        <Card className="border-dashed border-2 bg-gray-50 dark:bg-white/5 dark:border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
              <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Marks Available</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mt-2">
              Your test results will appear here once they are published.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Marks List */}
          <Card className="lg:col-span-2 border-0 shadow-lg bg-white dark:bg-[#0B1121] dark:text-white">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Recent Test Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {marks.slice(0, 5).map((mark, index) => {
                const percentage = parseFloat(getPercentage(mark.marks_obtained, mark.total_marks));
                return (
                  <div key={mark.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${percentage >= 75 ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400'}`}>
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm sm:text-base">{mark.test_name}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{mark.subject}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(mark.test_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2 mb-1">
                        <span className="font-bold text-lg">{mark.marks_obtained}/{mark.total_marks}</span>
                        {getTrendIcon(marks, index)}
                      </div>
                      <Badge className={`${getGradeColor(percentage)} text-white border-0`}>
                        Grade {getGrade(percentage)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Subject Performance Summary */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white dark:bg-[#0B1121] dark:text-white">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Subject Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(groupedMarks).map(([subject, subjectMarks]) => {
                  const totalObtained = subjectMarks.reduce((sum, mark) => sum + mark.marks_obtained, 0);
                  const totalMaximum = subjectMarks.reduce((sum, mark) => sum + mark.total_marks, 0);
                  const averagePercentage = ((totalObtained / totalMaximum) * 100).toFixed(1);

                  return (
                    <div key={subject}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">{subject}</span>
                        <span className="text-sm font-bold text-blue-500">{averagePercentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getGradeColor(parseFloat(averagePercentage))}`}
                          style={{ width: `${Math.min(parseFloat(averagePercentage), 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                        {subjectMarks.length} tests taken
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentMarks;
