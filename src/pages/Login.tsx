import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/students', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mobileNumber.trim() || !password.trim()) {
      return;
    }

    setIsLoggingIn(true);
    const success = await login(mobileNumber.trim(), password);
    
    if (success) {
      navigate('/students', { replace: true });
    }
    
    setIsLoggingIn(false);
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-sm sm:text-base text-gray-600 px-2">Access Visiona Education Academy Management System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <Label htmlFor="mobile" className="text-gray-700 text-sm sm:text-base">Mobile Number</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="Enter mobile number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="mt-1 border-gray-300 text-sm sm:text-base h-10 sm:h-12"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700 text-sm sm:text-base">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 border-gray-300 text-sm sm:text-base h-10 sm:h-12"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-4 text-sm sm:text-base font-medium"
            disabled={isLoggingIn || !mobileNumber.trim() || !password.trim()}
          >
            {isLoggingIn ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 text-center">
          <p className="text-xs sm:text-sm text-gray-500 px-2">
            Authorized personnel only. Contact administrator for access.
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

export default Login;