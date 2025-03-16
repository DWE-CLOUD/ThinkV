import React from 'react';
import { motion } from 'framer-motion';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', color = 'primary' }) => {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const colorMap = {
    primary: 'border-blue-500',
    secondary: 'border-gray-300',
    coffee: 'border-coffee-500',
    sand: 'border-sand-500',
    success: 'border-emerald-500',
    danger: 'border-rose-500',
  };

  const borderColor = colorMap[color as keyof typeof colorMap] || colorMap.primary;
  const sizeClass = sizeMap[size] || sizeMap.md;

  return (
    <motion.div
      className={`border-2 ${borderColor} border-t-transparent rounded-full ${sizeClass}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </motion.div>
  );
};

export default Loader;