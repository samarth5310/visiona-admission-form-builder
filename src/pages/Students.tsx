import React from 'react';
import { useOutletContext } from 'react-router-dom';
import StudentsSection from '@/components/StudentsSection';
import { User } from 'lucide-react';

const Students = () => {
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500 p-4 sm:p-6">
      <div className={`rounded-2xl p-6 shadow-lg ${isDarkMode ? 'bg-[#0B1121] text-white border border-white/5' : 'bg-white text-gray-900'}`}>
        <div className="flex items-center gap-4 mb-6">
          <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Student Management</h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Manage student records and database efficiently
            </p>
          </div>
        </div>

        <StudentsSection />
      </div>
    </div>
  );
};

export default Students;
