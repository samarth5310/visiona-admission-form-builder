import React from 'react';
import { motion } from 'framer-motion';
import NavbarItem, { NavbarItemType } from '@/components/NavbarItem';
import { useActiveTab } from '@/hooks/useActiveTab';

interface FloatingNavbarProps {
  role: 'admin' | 'student';
  items: NavbarItemType[];
  activeId: string;
  isDarkMode: boolean;
  onChange: (id: string) => void;
}

const FloatingNavbar = ({ role, items, activeId, isDarkMode, onChange }: FloatingNavbarProps) => {
  const { containerRef, setItemRef, bubbleX, bubbleVisible } = useActiveTab(
    activeId,
    items.map((item) => item.id)
  );

  return (
    <div className="fixed inset-x-0 bottom-4 sm:bottom-6 z-50 px-3 sm:px-6 pointer-events-none">
      <div className="mx-auto max-w-3xl pointer-events-auto">
        <motion.nav
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className={`relative mx-auto h-16 w-full rounded-full border px-6 py-2 shadow-xl overflow-hidden ${
            isDarkMode
              ? 'bg-[#0b0b0f]/90 border-white/10 backdrop-blur-md'
              : 'bg-white/90 border-black/10 backdrop-blur-md'
          }`}
        >
          <div className={`relative h-full overflow-x-auto overflow-y-hidden scrollbar-hide ${role === 'admin' ? '' : ''}`} style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-x' }}>
            <div
              ref={containerRef}
              className={`relative h-full flex items-center ${role === 'admin' ? 'w-max min-w-full' : 'w-max min-w-full sm:w-full'}`}
            >
            {bubbleVisible && (
              <motion.div
                className={`absolute top-1/2 -translate-y-1/2 z-0 w-10 h-10 rounded-full border ${
                  isDarkMode
                    ? 'bg-[#1a1a1f] border-white/10 shadow-lg shadow-white/10'
                    : 'bg-[#f3f4f6] border-black/10 shadow-lg shadow-black/10'
                }`}
                animate={{ x: bubbleX - 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}

            {items.map((item) => (
              <NavbarItem
                key={item.id}
                item={item}
                isActive={item.id === activeId}
                isDarkMode={isDarkMode}
                role={role}
                onClick={onChange}
                setRef={(el) => setItemRef(item.id, el)}
              />
            ))}
            </div>
          </div>
        </motion.nav>
      </div>
    </div>
  );
};

export default FloatingNavbar;
