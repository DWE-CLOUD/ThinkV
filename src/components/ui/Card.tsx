import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  hoverEffect?: boolean;
  animate?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  hoverEffect = false,
  animate = false,
}) => {
  const baseClasses = 'bg-beige-50 rounded-lg shadow-warm overflow-hidden border border-beige-200';
  const hoverClasses = hoverEffect
    ? 'transition duration-300 ease-in-out hover:shadow-warm-lg hover:border-beige-300'
    : '';

  return (
    <motion.div
      className={`${baseClasses} ${hoverClasses} ${className}`}
      initial={animate ? { opacity: 0, y: 20 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hoverEffect ? { scale: 1.01, y: -3 } : {}}
    >
      {title && (
        <div className="px-6 py-4 border-b border-beige-200">
          <h3 className="text-lg font-medium text-coffee-800">{title}</h3>
        </div>
      )}
      <div className={title ? 'p-6' : 'p-6 h-full'}>{children}</div>
    </motion.div>
  );
};

export default Card;