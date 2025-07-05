
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const StudentLogin = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if student is already logged in
  useEffect(() => {
    const studentData = localStorage.getItem('visiona_student_data');
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
      localStorage.setItem('visiona_student_data', JSON.stringify(studentData));

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-3 sm:px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-4 sm:p-6 lg:p-8 mx-2">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <img 
            src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
            alt="Visiona Education Academy Logo" 
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 object-contain"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Student Login</h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">Access your student dashboard</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <Label htmlFor="mobile" className="text-gray-700 text-sm sm:text-base">Mobile Number</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="Enter your registered mobile number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="mt-1 border-gray-300 text-sm sm:text-base h-10 sm:h-12"
              required
              maxLength={10}
            />
          </div>

          <div>
            <Label htmlFor="dob" className="text-gray-700 text-sm sm:text-base">Date of Birth</Label>
            <Input
              id="dob"
              type="date"
              placeholder="Select your date of birth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="mt-1 border-gray-300 text-sm sm:text-base h-10 sm:h-12"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the same date of birth you provided during admission
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 sm:py-4 text-sm sm:text-base font-medium"
            disabled={isLoggingIn || !mobileNumber.trim() || !dateOfBirth.trim()}
          >
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 text-center">
          <p className="text-xs sm:text-sm text-gray-500 px-2 mb-3">
            Use your registered mobile number and date of birth to login.
          </p>
          <p className="text-xs sm:text-sm text-gray-500 px-2">
            Contact the academy if you have trouble logging in.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="mt-3 text-sm"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
