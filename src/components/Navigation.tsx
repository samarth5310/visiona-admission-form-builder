
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, FileText, CreditCard } from 'lucide-react';
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
          <Button variant="outline" className="bg-white shadow-lg border-gray-300">
            <Menu className="h-4 w-4 mr-2" />
            Navigation
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white border border-gray-300 shadow-lg z-50">
          <DropdownMenuItem 
            onClick={() => onSectionChange('admission')}
            className={`cursor-pointer ${activeSection === 'admission' ? 'bg-gray-100' : ''}`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Admission Form
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onSectionChange('fees')}
            className={`cursor-pointer ${activeSection === 'fees' ? 'bg-gray-100' : ''}`}
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
