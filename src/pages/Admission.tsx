
import React from 'react';
import Navigation from '@/components/Navigation';
import Landing from './Landing';

const Admission = () => {
  return (
    <>
      <Navigation activeSection="admission" onSectionChange={() => {}} />
      <div className="min-h-screen">
        <Landing />
      </div>
    </>
  );
};

export default Admission;
