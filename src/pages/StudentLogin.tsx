import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Phone, Calendar, ArrowLeft, GraduationCap } from 'lucide-react';
import { safeStorage } from '@/utils/safeStorage';

const StudentLogin = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if student is already logged in
  useEffect(() => {
    const studentData = safeStorage.getItem('visiona_student_data');
    if (studentData) {
      navigate('/student-dashboard', { replace: true });
    }
  }, [navigate]);

  const validateMobileNumber = (mobile: string) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  };

  const formatDateForComparison = (dateString: string) => {
    // Convert input date (YYYY-MM-DD) to match database format
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!mobileNumber.trim() || !dateOfBirth.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateMobileNumber(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoggingIn(true);

    try {
      // Format the date for comparison
      const formattedDOB = formatDateForComparison(dateOfBirth);

      // Check if student exists with matching mobile number and DOB
      const { data: studentData, error: fetchError } = await supabase
        .from('applications')
        .select('*')
        .eq('contact_number', mobileNumber)
        .eq('date_of_birth', formattedDOB)
        .single();

      if (fetchError || !studentData) {
        setError('Invalid mobile number or date of birth. Please check your credentials.');
        return;
      }

      // Store student data in localStorage
      safeStorage.setItem('visiona_student_data', JSON.stringify(studentData));

      toast({
        title: "Login Successful",
        description: `Welcome back, ${studentData.full_name}!`,
      });

      navigate('/student-dashboard', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-md w-full bg-[#0B1121] border border-white/10 rounded-2xl shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)] p-8 relative z-10 backdrop-blur-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
            <GraduationCap className="w-10 h-10 text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Student Portal</h1>
          <p className="text-gray-400 text-sm">Access your dashboard, results, and more</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-gray-300 text-sm font-medium ml-1">Mobile Number</Label>
            <div className="relative group">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-green-500 transition-colors" />
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter registered mobile"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-11 focus:border-green-500/50 focus:ring-green-500/20 transition-all rounded-xl"
                required
                maxLength={10}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob" className="text-gray-300 text-sm font-medium ml-1">Date of Birth</Label>
            <div className="relative group">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 group-focus-within:text-green-500 transition-colors" />
              <Input
                id="dob"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-600 h-11 focus:border-green-500/50 focus:ring-green-500/20 transition-all rounded-xl [color-scheme:dark]"
                required
              />
            </div>
            <p className="text-xs text-gray-500 ml-1">
              Use the DOB provided during admission
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
              <div className="w-2 h-2 mt-2 rounded-full bg-red-500 shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-6 rounded-xl font-semibold shadow-[0_0_20px_-5px_rgba(16,185,129,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98]"
            disabled={isLoggingIn || !mobileNumber.trim() || !dateOfBirth.trim()}
          >
            {isLoggingIn ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Accessing Portal...</span>
              </div>
            ) : (
              'Login to Dashboard'
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-gray-500 mb-4">
            Having trouble? Contact the administration office.
          </p>
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white hover:bg-white/5 text-sm gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
