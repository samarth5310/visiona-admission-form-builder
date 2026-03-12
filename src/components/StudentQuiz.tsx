import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClipboardList, ArrowLeft, ExternalLink, GraduationCap, Users, Globe } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface StudentQuizProps {
  studentData: any;
  isDarkMode?: boolean;
}

const getEmbedUrl = (url: string): string => {
  if (!url) return '';
  // Convert Google Form view URL to embedded URL
  const cleaned = url.split('?')[0].replace(/\/formResponse$/, '/viewform');
  return cleaned.includes('?') ? `${cleaned}&embedded=true` : `${cleaned}?embedded=true`;
};

const StudentQuiz = ({ studentData, isDarkMode = true }: StudentQuizProps) => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);

  useEffect(() => {
    fetchQuizzes();
  }, [studentData]);

  const fetchQuizzes = async () => {
    if (!studentData?.id) return;
    try {
      const { data, error } = await supabase
        .from('exam_content')
        .select('*')
        .eq('content_type', 'form_link')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter quizzes relevant to this student:
      // 1. Universal (no target)
      // 2. Targeted to this student's class
      // 3. Targeted directly to this student
      const relevant = (data || []).filter((q: any) => {
        const noTarget = !q.target_class && !q.target_student_id;
        const classMatch = q.target_class && q.target_class.toLowerCase() === (studentData.class || '').toLowerCase();
        const studentMatch = q.target_student_id && (q.target_student_id === studentData.id || q.target_student_id === studentData.admission_number);
        return noTarget || classMatch || studentMatch;
      });

      setQuizzes(relevant);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (activeQuiz) {
    const embedUrl = getEmbedUrl(activeQuiz.data.url);
    return (
      <div className="space-y-4 animate-in fade-in-50 duration-300">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveQuiz(null)}
            className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quizzes
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white truncate">{activeQuiz.data.title}</h2>
          </div>
          <a href={activeQuiz.data.url} target="_blank" rel="noreferrer">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-white/10 shrink-0">
              <ExternalLink className="w-4 h-4 mr-1" /> Open
            </Button>
          </a>
        </div>

        <div className={`rounded-2xl overflow-hidden border ${isDarkMode ? 'border-white/10 bg-[#0B1121]' : 'border-gray-200 bg-white'}`} style={{ height: 'calc(100vh - 220px)' }}>
          <iframe
            src={embedUrl}
            title={activeQuiz.data.title}
            className="w-full h-full border-0"
            allow="autoplay"
          >
            Loading…
          </iframe>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-2xl font-bold text-white">Quizzes & Tests</h2>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Tap a quiz to open it directly inside the app
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : quizzes.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
          <ClipboardList className={`w-12 h-12 mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No quizzes assigned yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <Card
              key={quiz.id}
              onClick={() => setActiveQuiz(quiz)}
              className={`cursor-pointer border transition-all duration-200 hover:scale-[1.02] hover:shadow-xl ${isDarkMode ? 'bg-[#0B1121] border-white/5 hover:border-emerald-500/30' : 'bg-white border-gray-100 hover:border-emerald-200'}`}
            >
              <CardContent className="p-5 flex items-start gap-4">
                <div className={`p-3 rounded-xl shrink-0 ${isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                  <ClipboardList className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-base truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {quiz.data.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[10px] font-bold uppercase">
                      {quiz.subject}
                    </Badge>
                    {quiz.target_class && (
                      <span className={`flex items-center gap-1 text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        <GraduationCap className="w-3 h-3" /> Class {quiz.target_class}
                      </span>
                    )}
                    {quiz.target_student_id && (
                      <span className={`flex items-center gap-1 text-[10px] font-bold uppercase ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                        <Users className="w-3 h-3" /> Personal
                      </span>
                    )}
                    {!quiz.target_class && !quiz.target_student_id && (
                      <span className={`flex items-center gap-1 text-[10px] font-bold uppercase ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        <Globe className="w-3 h-3" /> All Students
                      </span>
                    )}
                  </div>
                </div>
                <ExternalLink className={`w-4 h-4 shrink-0 mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentQuiz;
