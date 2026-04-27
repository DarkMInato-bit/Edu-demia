import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]',
    secondary: 'bg-pink-600 text-white hover:bg-pink-700 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]',
    outline: 'border-2 border-indigo-600 text-indigo-400 hover:bg-indigo-600/10',
    ghost: 'text-gray-400 hover:text-white hover:bg-white/5',
  };

  // Note: Since I'm not using Tailwind in this setup (I chose no-tailwind), I'll use inline styles or CSS classes from globals.css
  // Wait, I used --no-tailwind in the command. I should use CSS classes.
  
  return (
    <button 
      className={`btn-${variant} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="spinner"></div>
      ) : children}
    </button>
  );
};
