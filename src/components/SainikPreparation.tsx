
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    BookOpen,
    Brain,
    ChevronRight,
    HelpCircle,
    Languages,
    Loader2,
    PlayCircle,
    Trophy,
    History,
    FileText,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Question {
    question: string;
    options: string[];
    correct_answer: number;
    explanation: string;
}

const DAILY_LIMIT = 5;

interface TeacherQuiz {
    id: string;
    title: string;
    url: string;
    subject: string;
    target_class?: string;
    attempted?: boolean;
}

const SainikPreparation = () => {
    const [language, setLanguage] = useState<'en' | 'kn'>('en');
    const [activeView, setActiveView] = useState<'dashboard' | 'ai_portal' | 'quiz' | 'results' | 'teacher_portal' | 'iframe_view'>('dashboard');
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<number[]>([]);
    const [score, setScore] = useState(0);
    const [dailyCount, setDailyCount] = useState(0);
    const [history, setHistory] = useState<any[]>([]);
    const [teacherQuizzes, setTeacherQuizzes] = useState<TeacherQuiz[]>([]);
    const [selectedForm, setSelectedForm] = useState<TeacherQuiz | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const storedData = localStorage.getItem('sainik_quiz_stats');
        const stats = storedData ? JSON.parse(storedData) : { date: today, count: 0 };

        if (stats.date !== today) {
            localStorage.setItem('sainik_quiz_stats', JSON.stringify({ date: today, count: 0 }));
            setDailyCount(0);
        } else {
            setDailyCount(stats.count || 0);
        }

        // Load local history
        const localHistory = JSON.parse(localStorage.getItem('sainik_quiz_history') || '[]');
        setHistory(localHistory);

        // Fetch Teacher Quizzes if student logged in
        fetchTeacherQuizzes();
    }, []);

    const fetchTeacherQuizzes = async () => {
        try {
            const studentStr = localStorage.getItem('visiona_student_data');
            if (!studentStr) return;
            const student = JSON.parse(studentStr);

            // Fetch quizzes targeting this class, this student, or everyone
            const { data, error } = await supabase
                .from('exam_content')
                .select('*')
                .eq('exam_type', 'sainik')
                .eq('content_type', 'form_link')
                .or(`target_class.eq."${student.class}",target_student_id.eq."${student.id}",and(target_class.is.null,target_student_id.is.null)`);

            if (data) {
                // Check for attempts in student_quiz_results for this specific student
                const { data: results } = await supabase
                    .from('student_quiz_results')
                    .select('content_id')
                    .eq('student_id', student.id);

                const attemptedIds = (results || []).map(r => r.content_id);

                const formatted = data.map(item => ({
                    id: item.id,
                    title: (item.data as any).title || 'General Quiz',
                    url: (item.data as any).url,
                    subject: item.subject || 'General',
                    attempted: attemptedIds.includes(item.id)
                }));
                setTeacherQuizzes(formatted);
            }
        } catch (err) {
            console.error('Error fetching teacher quizzes:', err);
        }
    };

    const toggleLanguage = () => setLanguage(prev => prev === 'en' ? 'kn' : 'en');

    const startQuiz = async (topic: string = 'General Mathematics') => {
        if (dailyCount >= DAILY_LIMIT) {
            toast({
                title: "Daily Limit Reached",
                description: `Daily limit of ${DAILY_LIMIT} AI quizzes exhausted.`,
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            setActiveView('quiz');
            setCurrentQuestionIndex(0);
            setUserAnswers([]);
            setScore(0);

            const { data, error } = await supabase.functions.invoke('generate-exam-content', {
                body: { examType: 'sainik', contentType: 'quiz', language, topic, count: 5 }
            });

            if (error) throw error;

            // Normalize questions if AI wrapped them
            let quizData = data;
            if (!Array.isArray(quizData) && (quizData as any).questions) {
                quizData = (quizData as any).questions;
            } else if (!Array.isArray(quizData) && (quizData as any).quiz) {
                quizData = (quizData as any).quiz;
            }

            if (!Array.isArray(quizData)) throw new Error("Invalid quiz format received");

            setQuestions(quizData);
            setUserAnswers(new Array(quizData.length).fill(undefined));
        } catch (error: any) {
            toast({ title: "AI Error", description: "Generation failed.", variant: "destructive" });
            setActiveView('ai_portal');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswerSelect = (idx: number) => {
        const newUserAnswers = [...userAnswers];
        newUserAnswers[currentQuestionIndex] = idx;
        setUserAnswers(newUserAnswers);
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        let finalScore = 0;

        questions.forEach((q, idx) => {
            const userAns = userAnswers[idx];
            let apiCorrect = q.correct_answer;
            let normalizedCorrect = -1;

            // 1. Handle string values like "0", "1", or "A", "B", "C", "D"
            if (typeof apiCorrect === 'string') {
                const upper = apiCorrect.trim().toUpperCase();
                if (upper === 'A' || upper === '0') normalizedCorrect = 0;
                else if (upper === 'B' || upper === '1') normalizedCorrect = 1;
                else if (upper === 'C' || upper === '2') normalizedCorrect = 2;
                else if (upper === 'D' || upper === '3') normalizedCorrect = 3;
                else {
                    const parsed = parseInt(apiCorrect);
                    if (!isNaN(parsed)) normalizedCorrect = parsed;
                }
            } else if (typeof apiCorrect === 'number') {
                normalizedCorrect = apiCorrect;
            }

            // 2. Adjust for 1-based indexing if AI returned 1, 2, 3, or 4
            // (If normalizedCorrect is 4, it's definitely 1-based. If it's 1-3, it's ambiguous but usually AI is asked for 0-3)
            // If the AI gives 1-4, we shift it to 0-3.
            if (normalizedCorrect >= 1 && normalizedCorrect <= 4 && !questions[idx].options[normalizedCorrect]) {
                // If the index normalizedCorrect exists as 1-4 but the 4th index is out of bounds, it's 1-based
                normalizedCorrect--;
            }

            if (userAns !== undefined && userAns !== null && Number(userAns) === normalizedCorrect) {
                finalScore++;
            }
        });

        setScore(finalScore);
        setActiveView('results');

        // Update Daily Count & History (Local Only)
        const today = new Date().toISOString().split('T')[0];
        const newCount = dailyCount + 1;
        localStorage.setItem('sainik_quiz_stats', JSON.stringify({ date: today, count: newCount }));
        setDailyCount(newCount);

        const newHistory = [{
            date: new Date().toLocaleString(),
            score: finalScore,
            total: questions.length,
            language
        }, ...history].slice(0, 50);

        localStorage.setItem('sainik_quiz_history', JSON.stringify(newHistory));
        setHistory(newHistory);
    };

    const openTeacherQuiz = (quiz: TeacherQuiz) => {
        if (quiz.attempted) {
            toast({
                title: "Already Attempted",
                description: "You have already completed this quiz. Only 1 attempt is allowed.",
                variant: "destructive"
            });
            return;
        }
        setSelectedForm(quiz);
        setActiveView('iframe_view');
    };

    const recordFormScore = async (manualScore: number) => {
        if (!selectedForm) return;

        try {
            const studentStr = localStorage.getItem('visiona_student_data');
            if (!studentStr) throw new Error("Student data missing");
            const student = JSON.parse(studentStr);

            const { error } = await supabase
                .from('student_quiz_results')
                .insert({
                    student_id: student.id,
                    content_id: selectedForm.id,
                    exam_type: 'sainik',
                    score: manualScore,
                    total_questions: 10, // Assuming 10 for forms or average
                    quiz_data: { type: 'google_form', url: selectedForm.url, student_name: student.full_name },
                    language: 'en'
                });

            if (error) throw error;

            toast({ title: "Score Recorded", description: "Your teacher will verify this." });
            fetchTeacherQuizzes(); // Refresh attempted status
            setActiveView('dashboard');
        } catch (err) {
            toast({ title: "Error", description: "Could not save score.", variant: "destructive" });
        }
    };

    const renderQuiz = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
                    <p className="text-gray-200 font-medium animate-pulse">
                        Sainik AI is generating your pro questions...
                    </p>
                </div>
            );
        }

        if (!questions.length) return null;

        const currentQuestion = questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto">
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-medium text-gray-300">
                        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                        <span>{Math.round(progress)}% Complete</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-white/10" indicatorClassName="bg-gradient-to-r from-blue-400 to-emerald-400" />
                </div>

                <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl overflow-hidden rounded-[2.5rem] shadow-2xl border">
                    <CardContent className="p-8 sm:p-12">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-10 leading-relaxed tracking-tight">
                            {currentQuestion.question}
                        </h3>

                        <div className="grid grid-cols-1 gap-5">
                            {currentQuestion.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswerSelect(idx)}
                                    className={`p-6 rounded-3xl text-left transition-all duration-300 border-2 flex items-center justify-between group
                    ${userAnswers[currentQuestionIndex] === idx
                                            ? 'bg-blue-600 border-blue-400 text-white shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)]'
                                            : 'bg-white/5 border-white/5 hover:border-white/20 text-slate-100 hover:bg-white/10'
                                        }`}
                                >
                                    <span className="font-bold text-lg">{option}</span>
                                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300
                    ${userAnswers[currentQuestionIndex] === idx
                                            ? 'border-white bg-white'
                                            : 'border-white/20 group-hover:border-white/40'}
                  `}>
                                        {userAnswers[currentQuestionIndex] === idx && (
                                            <CheckCircle2 className="h-5 w-5 text-blue-600 animate-in zoom-in duration-300" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-between items-center px-4">
                    <Button
                        variant="ghost"
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="text-gray-400 hover:text-white hover:bg-white/5 rounded-2xl h-14 px-6"
                    >
                        Previous
                    </Button>
                    <Button
                        onClick={nextQuestion}
                        disabled={userAnswers[currentQuestionIndex] === undefined}
                        className="bg-white text-slate-950 hover:bg-slate-200 h-14 px-10 rounded-[1.25rem] font-bold text-lg shadow-xl hover:scale-105 transition-all active:scale-95"
                    >
                        {currentQuestionIndex === questions.length - 1 ? 'Unlock Results' : 'Next Question'}
                        <ChevronRight className="ml-2 h-6 w-6" />
                    </Button>
                </div>
            </div>
        );
    };

    const renderResults = () => {
        const percentage = (score / questions.length) * 100;

        return (
            <div className="space-y-10 animate-in zoom-in duration-500 max-w-2xl mx-auto text-center py-10">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-emerald-500 blur-[100px] opacity-20 animate-pulse"></div>
                    <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-10 rounded-[2.5rem] shadow-2xl relative rotate-3">
                        <Trophy className="h-20 w-20 text-white" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h2 className="text-5xl font-bold tracking-tighter text-white uppercase">Quiz Completed!</h2>
                    <p className="text-slate-400 text-xl font-medium">Your evaluation is complete.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-4">
                    <Card className="bg-white/5 border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Score</p>
                        <h3 className="text-5xl font-bold text-blue-400">{score} <span className="text-2xl text-slate-600">/ {questions.length}</span></h3>
                    </Card>
                    <Card className="bg-white/5 border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Accuracy Rate</p>
                        <h3 className="text-5xl font-bold text-emerald-400">{Math.round(percentage)}%</h3>
                    </Card>
                </div>

                <div className="space-y-4 pt-6 max-w-sm mx-auto w-full px-4">
                    <Button
                        className="w-full h-16 bg-white text-slate-950 hover:bg-slate-200 rounded-2xl font-bold text-xl shadow-2xl transition-all"
                        onClick={() => setActiveView('dashboard')}
                    >
                        Finish Portal
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full h-14 text-slate-400 hover:text-white hover:bg-white/5 font-bold"
                        onClick={() => startQuiz()}
                    >
                        Retake Challenge
                    </Button>
                </div>
            </div>
        );
    };

    const renderAIPortal = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={() => setActiveView('dashboard')} className="text-gray-400">
                    <History className="mr-2 h-4 w-4" /> Back to Central
                </Button>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-4 py-2 font-bold">
                    {DAILY_LIMIT - dailyCount} AI Quizzes Remaining Today
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-gradient-to-br from-blue-600/20 via-slate-900 to-slate-950 border-white/10 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">AI Intelligence Generator</h3>
                            <p className="text-slate-400 mb-8 max-w-md">Our Frontier-3 Pro AI will analyze your weak areas and generate a custom 5-question mock exam instantly.</p>
                            <Button
                                onClick={() => startQuiz()}
                                className="bg-white text-black hover:bg-slate-200 h-16 px-12 rounded-2xl font-bold text-xl shadow-[0_20px_40px_-10px_rgba(255,255,255,0.2)] transition-all hover:scale-105"
                            >
                                <Brain className="mr-3 h-6 w-6 text-blue-600" /> Start Generation
                            </Button>
                        </div>
                        <div className="absolute right-[-10%] bottom-[-10%] opacity-10 group-hover:opacity-20 transition-opacity">
                            <Brain className="h-64 w-64 text-white" />
                        </div>
                    </Card>

                    <div className="space-y-4">
                        <h4 className="text-lg font-bold uppercase tracking-wider text-slate-500">Recent Performance</h4>
                        {history.length > 0 ? (
                            <div className="grid gap-3">
                                {history.map((item, i) => (
                                    <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl flex justify-between items-center backdrop-blur-sm">
                                        <div>
                                            <p className="text-white font-bold">{item.date}</p>
                                            <p className="text-xs text-slate-500 uppercase">{item.language === 'kn' ? 'Kannada' : 'English'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-blue-400">{item.score}/{item.total}</p>
                                            <p className="text-[10px] uppercase font-bold text-slate-600">Final Score</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-10 border-2 border-dashed border-white/5 rounded-3xl text-center">
                                <p className="text-slate-600 font-bold uppercase tracking-widest">No Recent Intelligence Logs</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="bg-slate-900 border-white/5 p-8 rounded-[2rem] border min-h-[300px]">
                        <h4 className="font-bold text-emerald-400 mb-4 tracking-tight">Topic Focus</h4>
                        {['Mathematics', 'Reasoning', 'General Knowledge', 'English Language', 'Intelligence'].map(t => (
                            <button key={t} onClick={() => startQuiz(t)} className="w-full p-4 mb-2 rounded-xl bg-white/5 hover:bg-white/10 text-left text-slate-300 font-bold text-sm transition-all flex items-center justify-between border border-transparent hover:border-blue-500/30">
                                {t} <ChevronRight className="h-4 w-4" />
                            </button>
                        ))}
                    </Card>
                </div>
            </div>
        </div>
    );

    const renderTeacherPortal = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <Button variant="ghost" onClick={() => setActiveView('dashboard')} className="text-gray-400">
                    <ChevronRight className="mr-2 h-4 w-4 rotate-180" /> Back
                </Button>
                <h3 className="text-2xl font-black italic text-emerald-400">TEACHER'S ASSIGNMENTS</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teacherQuizzes.sort((a, b) => Number(a.attempted) - Number(b.attempted)).map((quiz) => (
                    <Card key={quiz.id} className={`p-8 rounded-[2.5rem] border transition-all relative overflow-hidden group ${quiz.attempted ? 'bg-slate-900/40 border-white/5 opacity-60' : 'bg-white/5 border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/5 cursor-pointer'}`} onClick={() => openTeacherQuiz(quiz)}>
                        <div className="relative z-10">
                            <div className={`p-3 rounded-2xl w-fit mb-4 ${quiz.attempted ? 'bg-slate-800' : 'bg-emerald-500 shadow-lg shadow-emerald-500/20'}`}>
                                {quiz.attempted ? <CheckCircle2 className="h-6 w-6 text-slate-500" /> : <PlayCircle className="h-6 w-6 text-white" />}
                            </div>
                            <h4 className="text-xl font-bold text-white mb-2">{quiz.title}</h4>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{quiz.subject}</p>

                            {quiz.attempted && (
                                <Badge className="mt-8 bg-slate-800 text-slate-400 border-none font-black uppercase italic tracking-widest">Completed</Badge>
                            )}
                        </div>
                    </Card>
                ))}
                {teacherQuizzes.length === 0 && (
                    <div className="col-span-full py-20 text-center opacity-30">
                        <FileText className="h-20 w-20 mx-auto mb-4" />
                        <p className="text-xl font-black uppercase italic">No Quizzes Assigned Yet</p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderIframeView = () => (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col animate-in slide-in-from-bottom-full duration-500">
            <div className="h-20 bg-slate-900 border-b border-white/10 flex items-center justify-between px-6">
                <div>
                    <h3 className="text-white font-black italic">{selectedForm?.title}</h3>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Teacher Assignment Portal</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={() => {
                            const score = prompt("Please enter the score you received in the form:");
                            if (score !== null && !isNaN(Number(score))) {
                                recordFormScore(Number(score));
                            }
                        }}
                        className="bg-emerald-600 border-none text-white font-black"
                    >
                        Submit Score
                    </Button>
                    <Button variant="ghost" onClick={() => setActiveView('teacher_portal')} className="text-slate-400">Exit</Button>
                </div>
            </div>
            <div className="flex-1 bg-white">
                <iframe src={selectedForm?.url} className="w-full h-full border-none" title="Quiz Form" />
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight text-white mb-2">Exam Central</h2>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1 font-bold">
                            SAINIK PREP v3.0
                        </Badge>
                        <p className="text-slate-400 font-medium">Frontier Learning Portal</p>
                    </div>
                </div>

                <Button
                    variant="outline"
                    onClick={toggleLanguage}
                    className="bg-white/5 border-white/10 rounded-[1.25rem] px-8 py-8 hover:bg-white/10 transition-all ring-offset-slate-950 hover:ring-2 hover:ring-blue-500/50"
                >
                    <Languages className="mr-4 h-6 w-6 text-blue-400" />
                    <div className="text-left">
                        <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest mb-0.5">Translation</p>
                        <p className="font-extrabold text-white text-lg">{language === 'en' ? 'English' : 'ಕನ್ನಡ'}</p>
                    </div>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                <Card className="bg-[#0B1121] border-white/5 rounded-[2.5rem] p-10 hover:scale-[1.02] transition-all cursor-pointer group shadow-2xl relative overflow-hidden" onClick={() => setActiveView('ai_portal')}>
                    <div className="relative z-10">
                        <div className="bg-blue-600 p-5 rounded-3xl w-fit mb-8 shadow-2xl shadow-blue-600/20 group-hover:scale-110 transition-transform">
                            <Brain className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">AI Agentic Mocks</h3>
                        <p className="text-slate-400 font-medium text-sm leading-relaxed mb-10 max-w-xs">Dynamic problem sets generated using high-order reasoning models. View your streak and history.</p>
                        <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider group-hover:gap-4 transition-all">
                            Enter Portal <ChevronRight className="h-5 w-5" />
                        </div>
                    </div>
                </Card>

                <Card className="bg-[#0B1121] border-white/5 rounded-[2.5rem] p-10 hover:scale-[1.02] transition-all cursor-pointer group shadow-2xl" onClick={() => setActiveView('teacher_portal')}>
                    <div className="bg-emerald-500 p-5 rounded-3xl w-fit mb-8 shadow-2xl shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                        <FileText className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">Teacher's Corner</h3>
                    <p className="text-slate-400 font-medium text-sm leading-relaxed mb-10 max-w-xs">Access specialized worksheets and official mock tests assigned directly to your class.</p>
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider group-hover:gap-4 transition-all">
                        View Assignment <ChevronRight className="h-5 w-5" />
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 opacity-40 grayscale pointer-events-none">
                <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem]">
                    <Trophy className="h-8 w-8 text-yellow-500 mb-4" />
                    <h4 className="font-black text-white italic">ACHIEVEMENTS</h4>
                    <p className="text-xs text-slate-500 uppercase font-black">Coming Jan 2026</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem]">
                    <History className="h-8 w-8 text-blue-500 mb-4" />
                    <h4 className="font-black text-white italic">ARCHIVES</h4>
                    <p className="text-xs text-slate-500 uppercase font-black">Coming Jan 2026</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem]">
                    <BookOpen className="h-8 w-8 text-emerald-500 mb-4" />
                    <h4 className="font-black text-white italic">STUDY LABS</h4>
                    <p className="text-xs text-slate-500 uppercase font-black">Coming Jan 2026</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 font-sans">
            {activeView === 'dashboard' && renderDashboard()}
            {activeView === 'ai_portal' && renderAIPortal()}
            {activeView === 'teacher_portal' && renderTeacherPortal()}
            {activeView === 'iframe_view' && renderIframeView()}
            {activeView === 'quiz' && (
                <div className="pt-10">{renderQuiz()}</div>
            )}
            {activeView === 'results' && (
                <div className="pt-10">{renderResults()}</div>
            )}
        </div>
    );
};

export default SainikPreparation;
