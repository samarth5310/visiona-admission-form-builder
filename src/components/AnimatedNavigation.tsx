
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface NavigationItem {
  label: string;
  path: string;
  onClick?: () => void;
}

interface AnimatedNavigationProps {
  leftMenuItems: NavigationItem[];
  rightMenuItems: NavigationItem[];
  backgroundImage?: string;
  title?: string;
  children: React.ReactNode;
}

const AnimatedNavigation = ({ 
  leftMenuItems, 
  rightMenuItems, 
  backgroundImage,
  title,
  children 
}: AnimatedNavigationProps) => {
  const [leftMenuOpen, setLeftMenuOpen] = useState(false);
  const [rightMenuOpen, setRightMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string, customAction?: () => void) => {
    if (customAction) {
      customAction();
    } else {
      navigate(path);
    }
    setLeftMenuOpen(false);
    setRightMenuOpen(false);
  };

  return (
    <>
      {/* Hidden checkboxes for state management */}
      <input 
        type="checkbox" 
        id="menu1Toggle" 
        className="hidden"
        checked={leftMenuOpen}
        onChange={(e) => setLeftMenuOpen(e.target.checked)}
      />
      <input 
        type="checkbox" 
        id="menu2Toggle" 
        className="hidden"
        checked={rightMenuOpen}
        onChange={(e) => setRightMenuOpen(e.target.checked)}
      />

      <div className={`page-wrapper transition-all duration-300 ${rightMenuOpen ? 'pr-[200px]' : ''}`}>
        <div className={`page-content transition-all duration-300 bg-honeydew text-center ${rightMenuOpen ? 'scale-90' : ''}`}>
          {title && backgroundImage && (
            <div 
              className="full-screen-image h-screen w-screen max-w-full flex flex-col justify-center items-center bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${backgroundImage})`
              }}
            >
              <h1 className="pt-[25vh] text-[68px] text-[#ebebeb] font-thin uppercase" style={{ textShadow: '0 0 15px #333333' }}>
                {title}
              </h1>
            </div>
          )}
          
          <div className="text-content p-10">
            {children}
          </div>
        </div>

        {/* Left Menu Toggle */}
        <label 
          htmlFor="menu1Toggle"
          className={`menu-toggle menu-1-toggle fixed top-6 z-[100] px-2.5 py-1.5 border border-[#ebebeb] text-[#ebebeb] rounded cursor-pointer transition-all duration-300 ${
            leftMenuOpen ? 'left-[115px]' : 'left-6'
          }`}
          onClick={() => setLeftMenuOpen(!leftMenuOpen)}
        >
          <span className={`menu-label block ${leftMenuOpen ? 'hidden' : ''}`}>Menu</span>
          <span className={`close-label ${leftMenuOpen ? 'block' : 'hidden'}`}>Close</span>
        </label>

        {/* Right Menu Toggle */}
        <label 
          htmlFor="menu2Toggle"
          className="menu-toggle menu-2-toggle fixed top-6 right-6 z-[100] px-2.5 py-1.5 border border-[#ebebeb] text-[#ebebeb] rounded cursor-pointer transition-all duration-300"
          onClick={() => setRightMenuOpen(!rightMenuOpen)}
        >
          <span className={`menu-label block ${rightMenuOpen ? 'hidden' : ''}`}>Account</span>
          <span className={`close-label ${rightMenuOpen ? 'block' : 'hidden'}`}>Close</span>
        </label>
      </div>

      {/* Left Sidebar */}
      <div className={`sidebar menu-1 w-[200px] fixed top-0 bottom-0 pt-16 bg-[#333] text-[#bbbbbb] transition-all duration-300 z-50 ${
        leftMenuOpen ? 'left-0 shadow-[0_0_15px_#000]' : 'left-[-200px]'
      }`}>
        {leftMenuItems.map((item, index) => (
          <div 
            key={index}
            className="link py-2 px-6 cursor-pointer transition-all duration-300 font-light hover:text-[#ebebeb]"
            onClick={() => handleNavigation(item.path, item.onClick)}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* Right Sidebar */}
      <div className={`sidebar menu-2 w-[200px] fixed top-0 bottom-0 pt-16 bg-[#333] text-[#bbbbbb] transition-all duration-300 z-50 ${
        rightMenuOpen ? 'right-0' : 'right-[-200px]'
      }`}>
        {rightMenuItems.map((item, index) => (
          <div 
            key={index}
            className="link py-2 px-6 cursor-pointer transition-all duration-300 font-light hover:text-[#ebebeb]"
            onClick={() => handleNavigation(item.path, item.onClick)}
          >
            {item.label}
          </div>
        ))}
      </div>
    </>
  );
};

export default AnimatedNavigation;
