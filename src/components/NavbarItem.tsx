import React from 'react';
import { motion } from 'framer-motion';

export interface NavbarItemType {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
}

interface NavbarItemProps {
  item: NavbarItemType;
  isActive: boolean;
  isDarkMode: boolean;
  role: 'admin' | 'student';
  onClick: (id: string) => void;
  setRef: (el: HTMLButtonElement | null) => void;
}

const NavbarItem = ({ item, isActive, isDarkMode, role, onClick, setRef }: NavbarItemProps) => {
  const Icon = item.icon;

  return (
    <motion.button
      ref={setRef}
      onClick={() => onClick(item.id)}
      whileHover={{ y: -2, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`relative z-10 h-full px-2 rounded-full flex flex-col items-center justify-center gap-1 ${
        role === 'admin'
          ? 'w-[82px] flex-shrink-0'
          : 'w-[88px] sm:flex-1 sm:min-w-0 flex-shrink-0'
      }`}
    >
      <motion.div
        animate={{ scale: isActive ? 1.15 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        <Icon
          className={`w-5 h-5 transition-all duration-300 ${
            isActive
              ? isDarkMode
                ? 'text-white opacity-100'
                : 'text-black opacity-100'
              : isDarkMode
                ? 'text-gray-400 opacity-60'
                : 'text-gray-500 opacity-60'
          }`}
        />
      </motion.div>
      <span
        className={`text-xs leading-none whitespace-nowrap w-full text-center overflow-hidden text-ellipsis transition-all duration-300 ${
          isActive
            ? isDarkMode
              ? 'text-white font-semibold opacity-100'
              : 'text-black font-semibold opacity-100'
            : isDarkMode
              ? 'text-gray-400 font-medium opacity-60'
              : 'text-gray-500 font-medium opacity-60'
        }`}
      >
        {item.label}
      </span>
    </motion.button>
  );
};

export default NavbarItem;
