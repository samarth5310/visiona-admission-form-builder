import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Clock, Lightbulb, Rocket, Sparkles } from 'lucide-react';

import SainikPreparation from '@/components/SainikPreparation';

const CoursePreparation = () => {
    const { courseName } = useParams();
    const navigate = useNavigate();
    const [isDarkMode] = useState(true);

    const isSainik = courseName?.toLowerCase() === 'sainik';

    return (
        <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#020617] text-white' : 'bg-gray-50 text-gray-900'}`}>
            {/* Header / Navigation */}
            <header className="p-4 sm:p-6 sticky top-0 bg-[#020617]/80 backdrop-blur-md z-50">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">Back to Dashboard</span>
                </Button>
            </header>

            {isSainik ? (
                <main className="flex-1 py-8 sm:py-12">
                    <SainikPreparation />
                </main>
            ) : (
                /* Main Content for other exams (Coming Soon) */
                <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center max-w-4xl mx-auto">
                    <div className="relative mb-8 sm:mb-12">
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-[120px] opacity-20 animate-pulse"></div>
                        <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-6 sm:p-8 rounded-3xl shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                            <Rocket className="h-16 w-16 sm:h-24 sm:w-24 text-white animate-bounce" />
                        </div>
                        <div className="absolute -top-4 -right-4 bg-emerald-500 p-3 rounded-full shadow-lg animate-spin-slow">
                            <Sparkles className="h-6 w-6 text-white" />
                        </div>
                    </div>

                    <div className="space-y-4 sm:space-y-6 max-w-2xl w-full">
                        <h1 className="text-3xl md:text-6xl font-bold tracking-tight leading-tight px-2">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-purple-400">
                                {courseName?.toUpperCase()} Preparation
                            </span>
                            <br />
                            Is Landing Soon!
                        </h1>

                        <p className="text-base md:text-xl text-gray-400 font-medium px-4">
                            We're building an industry-leading learning experience for {courseName} students.
                            Interactive mock tests, video lectures, and smart study materials are on the way.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm group hover:border-blue-500/50 transition-colors">
                                <BookOpen className="h-10 w-10 text-blue-400 mb-4 mx-auto" />
                                <h3 className="font-bold text-lg mb-2">Full Syllabus</h3>
                                <p className="text-sm text-gray-500">Comprehensive coverage of all topics</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm group hover:border-emerald-500/50 transition-colors">
                                <Lightbulb className="h-10 w-10 text-emerald-400 mb-4 mx-auto" />
                                <h3 className="font-bold text-lg mb-2">Smart Tips</h3>
                                <p className="text-sm text-gray-500">Exclusive strategies to crack the exam</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm group hover:border-purple-500/50 transition-colors">
                                <Clock className="h-10 w-10 text-purple-400 mb-4 mx-auto" />
                                <h3 className="font-bold text-lg mb-2">Live Tests</h3>
                                <p className="text-sm text-gray-500">Real-time mock tests for practice</p>
                            </div>
                        </div>

                        <div className="pt-12">
                            <Button
                                className="h-14 px-10 text-lg font-bold bg-white text-black hover:bg-gray-200 rounded-2xl shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                                onClick={() => navigate('/student-dashboard')}
                            >
                                Notify Me When Live
                            </Button>
                        </div>
                    </div>
                </main>
            )}

            {/* Footer */}
            <footer className="p-8 text-center text-gray-500 text-sm">
                &copy; {new Date().getFullYear()} Visiona Academy. Excellence in every step.
            </footer>

            <style>
                {`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
                `}
            </style>
        </div>
    );
};

export default CoursePreparation;
