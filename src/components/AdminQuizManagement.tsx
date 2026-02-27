
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Plus,
    Trash2,
    ExternalLink,
    GraduationCap,
    Link as LinkIcon,
    Users,
    Search
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminQuizManagement = () => {
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Form State
    const [title, setTitle] = useState('');
    const [url, setUrl] = useState('');
    const [subject, setSubject] = useState('');
    const [targetClass, setTargetClass] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

    const { toast } = useToast();

    useEffect(() => {
        fetchQuizzes();
        fetchStudents();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const { data, error } = await supabase
                .from('exam_content')
                .select('*')
                .eq('content_type', 'form_link')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setQuizzes(data || []);
        } catch (error) {
            console.error('Error fetching quizzes:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        const { data } = await supabase.from('applications').select('id, full_name, class');
        setStudents(data || []);
    };

    const handleCreate = async () => {
        if (!title || !url || !subject) {
            toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
            return;
        }

        try {
            setSubmitting(true);
            const { error } = await supabase
                .from('exam_content')
                .insert({
                    exam_type: 'sainik',
                    content_type: 'form_link',
                    subject,
                    data: { title, url },
                    target_class: targetClass || null,
                    target_student_id: selectedStudent || null
                });

            if (error) throw error;

            toast({ title: "Success", description: "Quiz assigned successfully" });
            setTitle('');
            setUrl('');
            setSubject('');
            setTargetClass('');
            setSelectedStudent(null);
            fetchQuizzes();
        } catch (error) {
            toast({ title: "Error", description: "Could not save quiz", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this quiz?")) return;

        try {
            const { error } = await supabase
                .from('exam_content')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast({ title: "Deleted", description: "Quiz removed successfully" });
            fetchQuizzes();
        } catch (error) {
            toast({ title: "Error", description: "Could not delete quiz", variant: "destructive" });
        }
    };

    const filteredStudents = students.filter(s =>
        s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.class?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto font-sans">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Quiz Management</h1>
                <p className="text-slate-500 font-medium text-xs tracking-wide uppercase">Assign Google Forms to Classes or Students</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Creation Form */}
                <Card className="lg:col-span-1 bg-slate-900 border-white/5 p-8 rounded-[2rem] shadow-2xl h-fit">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-white font-bold text-xl flex items-center gap-2">
                            <Plus className="h-5 w-5 text-emerald-500" /> New Assignment
                        </CardTitle>
                    </CardHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-1">Quiz Title</label>
                            <Input
                                placeholder="E.g. Math Mock #4"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-white/5 border-white/10 text-white rounded-xl focus:ring-emerald-500/50"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-1">Google Form URL</label>
                            <Input
                                placeholder="https://forms.gle/..."
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="bg-white/5 border-white/10 text-white rounded-xl focus:ring-emerald-500/50"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-1">Subject</label>
                                <Input
                                    placeholder="GK / Math"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white rounded-xl focus:ring-emerald-500/50"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-1">Class (Optional)</label>
                                <Input
                                    placeholder="6th / 9th"
                                    value={targetClass}
                                    onChange={(e) => setTargetClass(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white rounded-xl focus:ring-emerald-500/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider px-1">Select Student (Optional)</label>
                            <div className="relative mb-2">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Search student..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-white/5 border-white/10 text-white rounded-xl text-sm"
                                />
                            </div>
                            <div className="max-h-40 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                                {filteredStudents.map(s => (
                                    <div
                                        key={s.id}
                                        onClick={() => setSelectedStudent(selectedStudent === s.id ? null : s.id)}
                                        className={`p-3 rounded-lg text-sm font-bold cursor-pointer transition-all border ${selectedStudent === s.id ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'}`}
                                    >
                                        {s.full_name}
                                        <span className="text-[10px] ml-2 opacity-50">Class {s.class}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={handleCreate}
                            disabled={submitting}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-14 rounded-2xl shadow-xl shadow-emerald-900/20 mt-4"
                        >
                            {submitting ? 'RELEASING...' : 'Release Quiz'}
                        </Button>
                    </div>
                </Card>

                {/* Listing */}
                <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-sm font-bold uppercase text-slate-500 tracking-wider mb-6">Live Assignments</h4>
                    {loading ? (
                        <div className="text-center py-20 text-slate-700 font-bold animate-pulse uppercase tracking-wider">Syncing Data...</div>
                    ) : (
                        <div className="grid gap-4">
                            {quizzes.map((quiz) => (
                                <Card key={quiz.id} className="bg-slate-900/50 border-white/5 p-6 rounded-[2rem] flex flex-col sm:flex-row justify-between items-center group hover:bg-slate-900 transition-all border">
                                    <div className="flex items-center gap-6 mb-4 sm:mb-0 w-full sm:w-auto">
                                        <div className="bg-slate-800 p-4 rounded-2xl">
                                            <LinkIcon className="h-6 w-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h5 className="text-white font-bold text-lg">{quiz.data.title}</h5>
                                                <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] font-bold uppercase">{quiz.subject}</Badge>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                {quiz.target_class && <span className="flex items-center gap-1"><GraduationCap className="h-3 w-3" /> Class {quiz.target_class}</span>}
                                                {quiz.target_student_id && <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Targeted Student</span>}
                                                {!quiz.target_class && !quiz.target_student_id && <span className="text-blue-500/50">Universal Release</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                        <a href={quiz.data.url} target="_blank" rel="noreferrer">
                                            <Button variant="ghost" size="icon" className="text-slate-500 hover:text-white hover:bg-white/10 rounded-xl">
                                                <ExternalLink className="h-5 w-5" />
                                            </Button>
                                        </a>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(quiz.id)}
                                            className="text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                            {quizzes.length === 0 && (
                                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
                                    <p className="text-slate-700 font-bold uppercase tracking-wider">Zero Active Deployments</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminQuizManagement;
