
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, CreditCard, Upload, Users, LogOut, BookOpen, GraduationCap, Home } from 'lucide-react';

interface HamburgerNavigationProps {
  userType: 'admin' | 'student';
  onLogout?: () => void;
}

const HamburgerNavigation = ({ userType, onLogout }: HamburgerNavigationProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else if (userType === 'admin') {
      logout();
      navigate('/login');
    } else {
      localStorage.removeItem('visiona_student_data');
      navigate('/');
    }
    setIsMenuOpen(false);
  };

  const adminItems = [
    { path: '/admission', label: 'Admission', icon: FileText },
    { path: '/students', label: 'Students', icon: Users },
    { path: '/homework', label: 'Homework', icon: BookOpen },
    { path: '/marks', label: 'Marks', icon: GraduationCap },
    { path: '/fees', label: 'Fees', icon: CreditCard },
    { path: '/documents', label: 'Documents', icon: Upload },
  ];

  const studentItems = [
    { path: '/student-dashboard', label: 'Dashboard', icon: Home },
    { path: '/homework', label: 'Homework', icon: BookOpen },
  ];

  const menuItems = userType === 'admin' ? adminItems : studentItems;

  return (
    <nav className="hamburger-nav">
      <div className="navbar">
        <div className="container nav-container">
          <input 
            className="checkbox" 
            type="checkbox" 
            checked={isMenuOpen}
            onChange={(e) => setIsMenuOpen(e.target.checked)}
          />
          <div className="hamburger-lines">
            <span className="line line1"></span>
            <span className="line line2"></span>
            <span className="line line3"></span>
          </div>
          <div className="logo">
            <div className="flex items-center space-x-2">
              <img 
                src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                alt="Logo" 
                className="w-8 h-8 object-contain"
              />
              <h1 className="text-lg font-bold">Visiona</h1>
            </div>
          </div>
          <div className="menu-items">
            {menuItems.map((item) => (
              <li key={item.path}>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(item.path);
                  }}
                  className="flex items-center space-x-3"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
            <li>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation('/');
                }}
                className="flex items-center space-x-3"
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </a>
            </li>
            <li>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
                className="flex items-center space-x-3 text-red-600"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </a>
            </li>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default HamburgerNavigation;
