
import React from 'react';
import { Button } from "@/components/ui/button";
import { Menu, Users, CreditCard } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Navigation = ({ activeSection, onSectionChange }: NavigationProps) => {
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
            onClick={() => onSectionChange('students')}
            className={`cursor-pointer hover:bg-blue-50 ${activeSection === 'students' ? 'bg-blue-100 text-blue-700' : ''}`}
          >
            <Users className="h-4 w-4 mr-2" />
            Students
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onSectionChange('fees')}
            className={`cursor-pointer hover:bg-blue-50 ${activeSection === 'fees' ? 'bg-blue-100 text-blue-700' : ''}`}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Fees Management
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Navigation;
