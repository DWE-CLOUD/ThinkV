import React from 'react';
import { motion } from 'framer-motion';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  // Define variant styles
  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-coffee-600 hover:bg-coffee-700 text-beige-50',
    secondary: 'bg-beige-200 hover:bg-beige-300 text-coffee-700',
    outline: 'bg-transparent border border-beige-300 hover:bg-beige-100 text-coffee-600 hover:text-coffee-800',
    ghost: 'bg-transparent hover:bg-beige-100 text-coffee-600 hover:text-coffee-800',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
  };

  // Define size styles
  const sizeStyles: Record<ButtonSize, string> = {
    xs: 'py-1 px-2 text-xs',
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-4',
    lg: 'py-2.5 px-5 text-lg',
  };

  // Combine all styles
  const buttonClasses = `
    font-medium rounded-lg shadow-warm flex items-center justify-center
    transition-all duration-200 ease-in-out
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${fullWidth ? 'w-full' : ''}
    ${disabled || isLoading ? 'opacity-60 cursor-not-allowed' : ''}
    ${className}
  `;

  return (
    <motion.button
      className={buttonClasses}
      disabled={disabled || isLoading}
      whileTap={{ scale: 0.98 }}
      whileHover={!disabled && !isLoading ? { scale: 1.02, boxShadow: "0 10px 15px -3px rgba(101, 78, 60, 0.1), 0 4px 6px -2px rgba(101, 78, 60, 0.05)" } : {}}
      {...props}
    >
      {isLoading && (
        <span className="mr-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
      )}
      
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </motion.button>
  );
};

export default Button;