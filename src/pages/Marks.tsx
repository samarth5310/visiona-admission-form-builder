
import React from 'react';
import Navigation from '@/components/Navigation';
import MarksManagement from '@/components/MarksManagement';

const Marks = () => {
  return (
    <>
      <Navigation activeSection="marks" onSectionChange={() => {}} />
      <div className="min-h-screen bg-background px-2 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto py-4 sm:py-6">
          <div className="bg-card border-2 sm:border-4 border-border rounded-lg shadow-lg">
            <div className="text-center border-b-2 border-border pb-4 sm:pb-6 mb-6 sm:mb-8 bg-muted rounded-t-lg p-3 sm:p-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">MARKS MANAGEMENT</h1>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">Student Performance Tracking and Test Results</p>
            </div>
            <div className="p-2 sm:p-4 lg:p-6">
              <MarksManagement />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Marks;
