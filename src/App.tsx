import React from 'react';
import AdminQuizzes from "./pages/AdminQuizzes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import StudentLogin from "./pages/StudentLogin";
import StudentDashboard from "./pages/StudentDashboard";
import Students from "./pages/Students";
import Admission from "./pages/Admission";
import Fees from "./pages/Fees";
import Documents from "./pages/Documents";
import Homework from "./pages/Homework";
import Marks from "./pages/Marks";
import NotFound from "./pages/NotFound";
import AdminDashboardHome from "./pages/AdminDashboardHome";
import Results from "./pages/Results";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Import Capacitor Core
import { Capacitor } from '@capacitor/core';
import MobileRoleSelection from "./pages/MobileRoleSelection";

const App: React.FC = () => {
  const isNative = Capacitor.isNativePlatform();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={isNative ? <MobileRoleSelection /> : <Landing />} />
                <Route path="/results" element={<Results />} />
                <Route path="/login" element={<Login />} />
                <Route path="/student-login" element={<StudentLogin />} />
                <Route path="/student-dashboard" element={<StudentDashboard />} />

                {/* Admin Routes */}
                <Route element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route path="/admin-dashboard" element={<AdminDashboardHome />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/admission" element={<Admission />} />
                  <Route path="/marks" element={<Marks />} />
                  <Route path="/fees" element={<Fees />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/homework" element={<Homework />} />
                  <Route path="/quizzes" element={<AdminQuizzes />} />
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};


export default App;