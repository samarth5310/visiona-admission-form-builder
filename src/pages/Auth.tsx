import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { authenticateStudent } from '@/services/studentAuthService';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') || 'student';
  const { login } = useAuth();
  const { toast } = useToast();

  const [isAdminSide, setIsAdminSide] = useState(role === 'admin');
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });
  const [studentForm, setStudentForm] = useState({ admissionNumber: '', dateOfBirth: '' });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsAdminSide(role === 'admin');
  }, [role]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.email || !adminForm.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await login(adminForm.email, adminForm.password);
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.admissionNumber || !studentForm.dateOfBirth) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const studentData = await authenticateStudent(
        studentForm.admissionNumber,
        studentForm.dateOfBirth
      );
      
      localStorage.setItem('visiona_student_data', JSON.stringify(studentData));
      navigate('/student-dashboard');
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid admission number or date of birth",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Back button */}
      <Button
        variant="outline"
        onClick={() => navigate('/auth-landing')}
        className="fixed top-4 left-4 z-50"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <div className={`auth-container ${isAdminSide ? 'right-panel-active' : ''}`}>
        {/* Student Login Form */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleStudentLogin} className="auth-form">
            <div className="flex items-center justify-center mb-6">
              <img 
                src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                alt="Logo" 
                className="w-12 h-12 object-contain mr-3"
              />
              <h1 className="text-2xl font-bold">Student Login</h1>
            </div>
            
            <span className="text-sm text-gray-600 mb-4">Enter your student credentials</span>
            
            <Input
              type="text"
              placeholder="Admission Number"
              value={studentForm.admissionNumber}
              onChange={(e) => setStudentForm({...studentForm, admissionNumber: e.target.value})}
              className="mb-4"
            />
            
            <Input
              type="date"
              placeholder="Date of Birth"
              value={studentForm.dateOfBirth}
              onChange={(e) => setStudentForm({...studentForm, dateOfBirth: e.target.value})}
              className="mb-6"
            />
            
            <Button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </div>

        {/* Admin Login Form */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleAdminLogin} className="auth-form">
            <div className="flex items-center justify-center mb-6">
              <img 
                src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                alt="Logo" 
                className="w-12 h-12 object-contain mr-3"
              />
              <h1 className="text-2xl font-bold">Admin Login</h1>
            </div>
            
            <span className="text-sm text-gray-600 mb-4">Enter your admin credentials</span>
            
            <Input
              type="email"
              placeholder="Email"
              value={adminForm.email}
              onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
              className="mb-4"
            />
            
            <div className="relative mb-6">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={adminForm.password}
                onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            <Button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </div>

        {/* Overlay */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1 className="text-3xl font-bold mb-4">Welcome Back!</h1>
              <p className="text-lg mb-6">
                Switch to Student Login to access your student portal
              </p>
              <Button 
                onClick={() => setIsAdminSide(false)}
                variant="outline"
                className="ghost-button"
              >
                Student Login
              </Button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1 className="text-3xl font-bold mb-4">Hello, Admin!</h1>
              <p className="text-lg mb-6">
                Switch to Admin Login to manage the education system
              </p>
              <Button 
                onClick={() => setIsAdminSide(true)}
                variant="outline"
                className="ghost-button"
              >
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      </div>

      
      <style dangerouslySetInnerHTML={{
        __html: `
        .auth-container {
          background-color: #fff;
          border-radius: 10px;
          box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
          position: relative;
          overflow: hidden;
          width: 768px;
          max-width: 100%;
          min-height: 480px;
        }

        .form-container {
          position: absolute;
          top: 0;
          height: 100%;
          transition: all 0.6s ease-in-out;
        }

        .sign-in-container {
          left: 0;
          width: 50%;
          z-index: 2;
        }

        .auth-container.right-panel-active .sign-in-container {
          transform: translateX(100%);
        }

        .sign-up-container {
          left: 0;
          width: 50%;
          opacity: 0;
          z-index: 1;
        }

        .auth-container.right-panel-active .sign-up-container {
          transform: translateX(100%);
          opacity: 1;
          z-index: 5;
          animation: show 0.6s;
        }

        @keyframes show {
          0%, 49.99% {
            opacity: 0;
            z-index: 1;
          }
          50%, 100% {
            opacity: 1;
            z-index: 5;
          }
        }

        .overlay-container {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 100%;
          overflow: hidden;
          transition: transform 0.6s ease-in-out;
          z-index: 100;
        }

        .auth-container.right-panel-active .overlay-container {
          transform: translateX(-100%);
        }

        .overlay {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #FFFFFF;
          position: relative;
          left: -100%;
          height: 100%;
          width: 200%;
          transform: translateX(0);
          transition: transform 0.6s ease-in-out;
        }

        .auth-container.right-panel-active .overlay {
          transform: translateX(50%);
        }

        .overlay-panel {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 40px;
          text-align: center;
          top: 0;
          height: 100%;
          width: 50%;
          transform: translateX(0);
          transition: transform 0.6s ease-in-out;
        }

        .overlay-left {
          transform: translateX(-20%);
        }

        .auth-container.right-panel-active .overlay-left {
          transform: translateX(0);
        }

        .overlay-right {
          right: 0;
          transform: translateX(0);
        }

        .auth-container.right-panel-active .overlay-right {
          transform: translateX(20%);
        }

        .auth-form {
          background-color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          padding: 0 50px;
          height: 100%;
          text-align: center;
        }

        .auth-button {
          border-radius: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #FFFFFF;
          font-size: 12px;
          font-weight: bold;
          padding: 12px 45px;
          letter-spacing: 1px;
          text-transform: uppercase;
          transition: transform 80ms ease-in;
          border: none;
        }

        .auth-button:hover {
          transform: scale(1.05);
        }

        .ghost-button {
          background-color: transparent !important;
          border: 1px solid #FFFFFF !important;
          color: #FFFFFF !important;
        }

        .ghost-button:hover {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
        `
      }} />
    </div>
  );
};

export default Auth;