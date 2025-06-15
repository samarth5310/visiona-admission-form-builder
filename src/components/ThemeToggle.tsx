
import React from 'react';
import { Button } from "@/components/ui/button";
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="icon"
      className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 text-gray-700 dark:text-gray-300" />
      ) : (
        <Sun className="h-4 w-4 text-yellow-500" />
      )}
    </Button>
  );
};

export default ThemeToggle;
