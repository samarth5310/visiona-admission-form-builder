import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { GraduationCap, UserCheck } from 'lucide-react';

const AuthLanding = () => {
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    navigate('/auth?role=admin');
  };

  const handleStudentLogin = () => {
    navigate('/auth?role=student');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <img 
            src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
            alt="Visiona Education Academy" 
            className="w-20 h-20 mx-auto mb-6 object-contain"
          />
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Visiona Education Academy
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Choose your login type to access your dashboard
          </p>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Admin Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserCheck className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Login</h2>
              <p className="text-gray-600 mb-8">
                Access the admin dashboard to manage students, assignments, fees, and more.
              </p>
              <Button 
                onClick={handleAdminLogin}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                size="lg"
              >
                Login as Admin
              </Button>
            </div>
          </div>

          {/* Student Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Student Login</h2>
              <p className="text-gray-600 mb-8">
                Access your student portal to view homework, marks, fees, and more.
              </p>
              <Button 
                onClick={handleStudentLogin}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                size="lg"
              >
                Login as Student
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-gray-500">
            Need help? Contact your institution administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLanding;