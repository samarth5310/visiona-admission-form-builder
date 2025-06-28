
import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu, FileText, CreditCard, Upload, Users, LogOut, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Navigation = ({ activeSection }: NavigationProps) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-white text-gray-800 shadow-lg border-gray-300 hover:bg-gray-50">
            <Menu className="h-4 w-4 mr-2" />
            Navigation
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white border border-gray-300 shadow-lg z-50 w-48">
          <DropdownMenuItem 
            onClick={() => handleNavigation('/admission')}
            className={`cursor-pointer hover:bg-blue-50 ${activeSection === 'admission' ? 'bg-blue-100 text-blue-700' : ''}`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Admission Form
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleNavigation('/students')}
            className={`cursor-pointer hover:bg-blue-50 ${activeSection === 'students' ? 'bg-blue-100 text-blue-700' : ''}`}
          >
            <Users className="h-4 w-4 mr-2" />
            Students
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleNavigation('/homework')}
            className={`cursor-pointer hover:bg-blue-50 ${activeSection === 'homework' ? 'bg-blue-100 text-blue-700' : ''}`}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Manage Homework
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleNavigation('/fees')}
            className={`cursor-pointer hover:bg-blue-50 ${activeSection === 'fees' ? 'bg-blue-100 text-blue-700' : ''}`}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Fees Management
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleNavigation('/documents')}
            className={`cursor-pointer hover:bg-blue-50 ${activeSection === 'documents' ? 'bg-blue-100 text-blue-700' : ''}`}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={handleLogout}
            className="cursor-pointer hover:bg-red-50 text-red-600"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout ({user?.name})
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Navigation;
