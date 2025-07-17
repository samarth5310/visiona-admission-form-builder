
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText, CreditCard, Upload, Users, LogOut, BookOpen, GraduationCap, Home, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Navigation = ({ activeSection }: NavigationProps) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const navigationItems = [
    { path: '/admission', label: 'Admission', icon: FileText, section: 'admission' },
    { path: '/students', label: 'Students', icon: Users, section: 'students' },
    { path: '/homework', label: 'Homework', icon: BookOpen, section: 'homework' },
    { path: '/marks', label: 'Marks', icon: GraduationCap, section: 'marks' },
    { path: '/fees', label: 'Fees', icon: CreditCard, section: 'fees' },
    { path: '/documents', label: 'Documents', icon: Upload, section: 'documents' },
  ];

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo Only */}
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
              alt="Logo" 
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
            />
          </div>

          {/* Desktop Navigation Menu */}
          <div className="hidden md:flex flex-1 mx-4 sm:mx-6">
            <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide">
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center space-x-1 whitespace-nowrap px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm ${
                    activeSection === item.section ? 'bg-blue-100 text-blue-700' : ''
                  }`}
                >
                  <item.icon className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Menu Header */}
                  <div className="p-4 border-b">
                    <div className="flex items-center space-x-2">
                      <img 
                        src="/lovable-uploads/b537825f-b519-4377-84f5-fa9b1a028acf.png" 
                        alt="Logo" 
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                  </div>

                  {/* Mobile Navigation Items */}
                  <div className="flex-1 py-4">
                    <nav className="space-y-1 px-2">
                      {navigationItems.map((item) => (
                        <Button
                          key={item.path}
                          variant="ghost"
                          onClick={() => handleNavigation(item.path)}
                          className={`w-full justify-start text-left px-3 py-2 ${
                            activeSection === item.section ? 'bg-blue-100 text-blue-700' : ''
                          }`}
                        >
                          <item.icon className="h-4 w-4 mr-3" />
                          {item.label}
                        </Button>
                      ))}
                    </nav>
                  </div>

                  {/* Mobile Menu Footer */}
                  <div className="border-t p-4 space-y-2">
                    <Button
                      variant="ghost"
                      onClick={() => handleNavigation('/')}
                      className="w-full justify-start text-left px-3 py-2"
                    >
                      <Home className="h-4 w-4 mr-3" />
                      Home
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full justify-start text-left px-3 py-2"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigation('/')}
              className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
            >
              <Home className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
