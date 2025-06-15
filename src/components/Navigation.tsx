
import React from 'react';
import { Button } from "@/components/ui/button";

interface NavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Navigation = ({ activeSection, onSectionChange }: NavigationProps) => {
  return (
    <div className="flex gap-4 mb-6 border-b pb-4">
      <Button 
        variant={activeSection === 'admission' ? 'default' : 'outline'}
        onClick={() => onSectionChange('admission')}
        className="px-6"
      >
        Admission Form
      </Button>
      <Button 
        variant={activeSection === 'fees' ? 'default' : 'outline'}
        onClick={() => onSectionChange('fees')}
        className="px-6"
      >
        Fees Management
      </Button>
    </div>
  );
};

export default Navigation;
