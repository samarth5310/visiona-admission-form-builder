
import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu, FileText, CreditCard, Upload, Users, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface NavigationProps {
  activeSection: string;
  onSectionChange?: (section: string) => void; // now optional since page changes on route
}

const Navigation = ({ activeSection }: NavigationProps) => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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
            onClick={() => navigate("/admission")}
            className={`cursor-pointer hover:bg-blue-50 ${activeSection === 'admission' ? 'bg-blue-100 text-blue-700' : ''}`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Admission Form
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate("/students")}
            className={`cursor-pointer hover:bg-blue-50 ${activeSection === 'students' ? 'bg-blue-100 text-blue-700' : ''}`}
          >
            <Users className="h-4 w-4 mr-2" />
            Students
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate("/fees")}
            className={`cursor-pointer hover:bg-blue-50 ${activeSection === 'fees' ? 'bg-blue-100 text-blue-700' : ''}`}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Fees Management
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate("/documents")}
            className={`cursor-pointer hover:bg-blue-50 ${activeSection === 'documents' ? 'bg-blue-100 text-blue-700' : ''}`}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            className={"cursor-pointer hover:bg-red-100 text-red-800 mt-1 border-t border-gray-200 flex items-center"}
          >
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Navigation;
