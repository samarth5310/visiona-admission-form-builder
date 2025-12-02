import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Medal, Award, RefreshCw, Star } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StudentRanking {
  id: string;
  full_name: string;
  class: string;
  total_score: number;
  rank: number;
  is_current_student: boolean;
}

const StudentLeaderboard = () => {
  const [rankings, setRankings] = useState<StudentRanking[]>([]);
  const [currentStudentRank, setCurrentStudentRank] = useState<StudentRanking | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const studentData = JSON.parse(localStorage.getItem('visiona_student_data') || '{}');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);

      // Fetch all student marks
      const { data: marksData, error: marksError } = await supabase
        .from('student_marks')
        .select(`
          student_id,
          marks_obtained,
          applications (
            id,
            full_name,
            class
          )
        `);

      if (marksError) throw marksError;

      // Group marks by student and calculate total scores
      const studentScores: { [key: string]: { student: any; total_score: number } } = {};

      marksData?.forEach((mark) => {
        const studentId = mark.student_id;
        const student = mark.applications;

        if (!studentScores[studentId]) {
          studentScores[studentId] = {
            student,
            total_score: 0
          };
        }

        studentScores[studentId].total_score += mark.marks_obtained;
      });

      // Convert to array and sort by total score
      const sortedStudents = Object.entries(studentScores)
        .map(([id, data]) => ({
          id,
          full_name: data.student.full_name,
          class: data.student.class,
          total_score: data.total_score,
          rank: 0, // Will be set below
          is_current_student: id === studentData.id
        }))
        .sort((a, b) => b.total_score - a.total_score);

      // Assign ranks
      sortedStudents.forEach((student, index) => {
        student.rank = index + 1;
      });

      // Find current student's ranking
      const currentStudent = sortedStudents.find(s => s.is_current_student);
      setCurrentStudentRank(currentStudent || null);

      // Prepare display rankings (top 10 with current student always visible)
      let displayRankings = sortedStudents.slice(0, 10);

      // If current student is not in top 10, replace the 10th position
      if (currentStudent && currentStudent.rank > 10) {
        displayRankings[9] = currentStudent;
      }

      setRankings(displayRankings);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leaderboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <Star className="h-5 w-5 text-blue-500" />;
    }
  };

  const getRankBadgeColor = (rank: number, isCurrentStudent: boolean) => {
    if (isCurrentStudent) {
      return 'bg-blue-600 text-white';
    }

    switch (rank) {
      case 1:
        return 'bg-yellow-500 text-white';
      case 2:
        return 'bg-gray-400 text-white';
      case 3:
        return 'bg-amber-600 text-white';
      default:
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300';
    }
  };

  const getDisplayName = (student: StudentRanking) => {
    if (student.rank === 1 || student.is_current_student) {
      return student.full_name;
    }
    return 'Student ' + student.id.slice(0, 4);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <Card className="border-dashed border-2 bg-gray-50 dark:bg-white/5 dark:border-white/10">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
            <Trophy className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No Rankings Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mt-2">
            Leaderboard will update once marks are uploaded.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white dark:bg-[#0B1121] dark:text-white overflow-hidden">
      <CardHeader className="border-b border-gray-100 dark:border-white/5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Performers
            </CardTitle>
            <CardDescription className="text-gray-500 dark:text-gray-400">Based on total academic score</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchLeaderboard}
            disabled={loading}
            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100 dark:divide-white/5">
          {rankings.map((student) => (
            <div
              key={student.id}
              className={`flex items-center justify-between p-4 transition-colors ${student.is_current_student
                  ? 'bg-blue-50/50 dark:bg-blue-900/10'
                  : 'hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(student.rank)}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm ${student.is_current_student ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                      }`}>
                      {getDisplayName(student)}
                    </p>
                    {student.is_current_student && (
                      <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Class {student.class}</p>
                </div>
              </div>

              <div className="text-right">
                <div className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold ${getRankBadgeColor(student.rank, student.is_current_student)}`}>
                  #{student.rank}
                </div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">
                  {student.total_score} pts
                </p>
              </div>
            </div>
          ))}
        </div>

        {currentStudentRank && (
          <div className="p-4 bg-gray-50 dark:bg-white/5 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Your Position</span>
              <span className="font-bold text-gray-900 dark:text-white">
                Top {Math.ceil((currentStudentRank.rank / rankings.length) * 100)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentLeaderboard;