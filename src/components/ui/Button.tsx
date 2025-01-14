import { ReactNode } from 'react';

interface ButtonProps {
  text?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  startIcon?: ReactNode;
  onClick?: () => void;
  className?: string;
}

const Button = ({ 
  text, 
  variant = 'primary', 
  size = 'md', 
  startIcon, 
  onClick,
  className = ''
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
    >
      {startIcon && <span className="mr-2">{startIcon}</span>}
      {text}
    </button>
  );
};

export default Button;