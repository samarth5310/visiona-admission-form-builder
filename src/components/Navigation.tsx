
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, FileText, CreditCard, Upload, Users } from 'lucide-react';
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
          <Button variant="outline" className="gradient-header shadow-lg border-none hover:shadow-xl transition-all duration-300">
            <Menu className="h-4 w-4 mr-2" />
            Navigation
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="dropdown-enhanced z-50 w-48">
          <DropdownMenuItem 
            onClick={() => onSectionChange('admission')}
            className={`cursor-pointer hover:bg-accent transition-colors duration-200 ${activeSection === 'admission' ? 'bg-accent text-accent-foreground' : ''}`}
          >
            <FileText className="h-4 w-4 mr-2 icon-accent" />
            Admission Form
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onSectionChange('students')}
            className={`cursor-pointer hover:bg-accent transition-colors duration-200 ${activeSection === 'students' ? 'bg-accent text-accent-foreground' : ''}`}
          >
            <Users className="h-4 w-4 mr-2 icon-accent" />
            Students
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onSectionChange('fees')}
            className={`cursor-pointer hover:bg-accent transition-colors duration-200 ${activeSection === 'fees' ? 'bg-accent text-accent-foreground' : ''}`}
          >
            <CreditCard className="h-4 w-4 mr-2 icon-accent" />
            Fees Management
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onSectionChange('documents')}
            className={`cursor-pointer hover:bg-accent transition-colors duration-200 ${activeSection === 'documents' ? 'bg-accent text-accent-foreground' : ''}`}
          >
            <Upload className="h-4 w-4 mr-2 icon-accent" />
            Upload Documents
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Navigation;
