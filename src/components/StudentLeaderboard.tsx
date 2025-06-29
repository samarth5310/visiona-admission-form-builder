import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Medal, Award, RefreshCw } from 'lucide-react';
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
        return <Trophy className="h-5 w-5 text-blue-500" />;
    }
  };

  const getRankBadgeColor = (rank: number, isCurrentStudent: boolean) => {
    if (isCurrentStudent) {
      return 'bg-blue-500 text-white';
    }
    
    switch (rank) {
      case 1:
        return 'bg-yellow-500 text-white';
      case 2:
        return 'bg-gray-400 text-white';
      case 3:
        return 'bg-amber-600 text-white';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getDisplayName = (student: StudentRanking) => {
    if (student.rank === 1 || student.is_current_student) {
      return student.full_name;
    }
    return 'XXXXX';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Trophy className="h-5 w-5" />
            Student Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">Loading rankings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (rankings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Trophy className="h-5 w-5" />
            Student Leaderboard
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">Top performing students based on total marks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 sm:py-12">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">No rankings available yet</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Rankings will appear once marks are uploaded</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Trophy className="h-5 w-5" />
              Student Leaderboard
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">Top performing students based on total marks</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLeaderboard}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="space-y-2 sm:space-y-3">
          {rankings.map((student) => (
            <div
              key={student.id}
              className={`flex items-center justify-between p-3 sm:p-4 rounded-lg border transition-colors ${
                student.is_current_student
                  ? 'bg-blue-50 border-blue-200 shadow-sm'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="flex items-center gap-2 shrink-0">
                  {getRankIcon(student.rank)}
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-bold ${getRankBadgeColor(
                      student.rank,
                      student.is_current_student
                    )}`}
                  >
                    #{student.rank}
                  </span>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm sm:text-base truncate ${
                      student.is_current_student ? 'text-blue-700' : 'text-gray-900'
                    }`}>
                      {getDisplayName(student)}
                    </p>
                    {student.is_current_student && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium shrink-0">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600">Class: {student.class}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className={`font-bold text-sm sm:text-lg ${
                  student.is_current_student ? 'text-blue-700' : 'text-gray-900'
                }`}>
                  {student.total_score}
                </p>
                <p className="text-xs text-gray-500">points</p>
              </div>
            </div>
          ))}
        </div>

        {currentStudentRank && (
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-100 rounded-lg border border-blue-200">
            <div className="text-center">
              <p className="text-sm sm:text-base text-blue-800 font-medium">
                Your Current Ranking
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Trophy className="h-5 w-5 text-blue-600" />
                <span className="text-lg sm:text-xl font-bold text-blue-700">
                  #{currentStudentRank.rank} out of {rankings.length} students
                </span>
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Total Score: {currentStudentRank.total_score} points
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Rankings are updated automatically when new marks are added
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentLeaderboard;