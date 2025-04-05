import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  size = 'md',
  disabled = false,
  className = '',
}) => {
  const sizes = {
    sm: {
      track: 'w-8 h-4',
      thumb: 'w-3 h-3',
      translateX: checked ? 'translate-x-4' : 'translate-x-1',
    },
    md: {
      track: 'w-11 h-6',
      thumb: 'w-4 h-4',
      translateX: checked ? 'translate-x-6' : 'translate-x-1',
    },
    lg: {
      track: 'w-14 h-7',
      thumb: 'w-5 h-5',
      translateX: checked ? 'translate-x-8' : 'translate-x-1',
    },
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center ${className}`}>
      <button
        type="button"
        className={`
          relative inline-flex flex-shrink-0 items-center
          ${currentSize.track}
          rounded-full focus:outline-none focus:ring-2 focus:ring-coffee-300 focus:ring-offset-1
          ${checked ? 'bg-coffee-600' : 'bg-beige-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          transition-colors duration-200 ease-in-out
        `}
        onClick={disabled ? undefined : onChange}
        disabled={disabled}
        aria-checked={checked}
        role="switch"
      >
        <motion.span
          className={`
            ${currentSize.thumb}
            bg-white rounded-full shadow transform
            transition-transform duration-200 ease-in-out
          `}
          animate={{ x: checked ? (size === 'sm' ? 13 : size === 'md' ? 20 : 28) : 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
      {label && (
        <span
          className={`ml-2 text-sm ${checked ? 'text-coffee-800' : 'text-coffee-600'} ${
            disabled ? 'opacity-50' : ''
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default Switch;