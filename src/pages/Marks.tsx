import React from 'react';
import { useOutletContext } from 'react-router-dom';
import MarksManagement from '@/components/MarksManagement';

const Marks = () => {
  const { isDarkMode } = useOutletContext<{ isDarkMode: boolean }>();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900'}`}>
      <div className="w-full">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white/70 border-gray-200/50'} backdrop-blur-sm rounded-2xl shadow-xl border overflow-hidden`}>
            <MarksManagement />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marks;
