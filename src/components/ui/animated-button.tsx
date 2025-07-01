
import React from 'react';
import { cn } from "@/lib/utils";

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'light';
  href?: string;
  asLink?: boolean;
}

const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ className, variant = 'default', children, href, asLink = false, ...props }, ref) => {
    const baseClasses = `
      text-base font-semibold
      px-6 py-6 pl-8
      flex items-center
      rounded-full
      relative
      transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)]
      group
      ${variant === 'default' 
        ? 'bg-[#154633] hover:bg-[#154633]' 
        : 'bg-[#95C11F] hover:bg-[#95C11F]'
      }
    `;

    const textClasses = `
      text-white
      leading-none
      relative
      z-[5]
      mr-8
    `;

    const iconClasses = `
      inline-block
      relative
      z-[5]
      transition-all duration-500 ease-[cubic-bezier(0.77,0,0.175,1)]
      group-hover:rotate-45 group-hover:-translate-x-2
    `;

    const beforeClasses = `
      before:content-['']
      ${variant === 'default' 
        ? 'before:bg-[#95C11F]' 
        : 'before:bg-[#154633]'
      }
      before:w-8
      before:h-8
      before:block
      before:absolute
      before:z-[1]
      before:rounded-full
      before:top-1/2
      before:right-4
      before:-translate-y-1/2
      before:transition-all before:duration-500 before:ease-[cubic-bezier(0.77,0,0.175,1)]
      hover:before:w-full
      hover:before:h-full
      hover:before:right-0
    `;

    const content = (
      <>
        <span className={textClasses}>{children}</span>
        <svg 
          className={iconClasses}
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M4.66669 11.3334L11.3334 4.66669" 
            stroke="white" 
            strokeWidth="1.33333" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          <path 
            d="M4.66669 4.66669H11.3334V11.3334" 
            stroke="white" 
            strokeWidth="1.33333" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </>
    );

    if (asLink && href) {
      return (
        <a 
          href={href}
          className={cn(baseClasses, beforeClasses, className)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        className={cn(baseClasses, beforeClasses, className)}
        ref={ref}
        {...props}
      >
        {content}
      </button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton };
