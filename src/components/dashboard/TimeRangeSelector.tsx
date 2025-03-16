import React from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';
import { TimeRange } from '../../types';

const TimeRangeSelector: React.FC = () => {
  const { selectedTimeRange, setSelectedTimeRange } = useAppContext();

  const timeRanges: { label: string; value: TimeRange }[] = [
    { label: '1h', value: '1h' },
    { label: '6h', value: '6h' },
    { label: '24h', value: '24h' },
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
    { label: '90d', value: '90d' },
  ];

  return (
    <div className="flex items-center">
      <div className="text-sm text-coffee-500 mr-2">Time Range:</div>
      <div className="inline-flex rounded-md shadow-sm bg-beige-200 p-0.5">
        {timeRanges.map((range, index) => (
          <button
            key={range.value}
            type="button"
            className={`
              relative px-3 py-1.5 text-sm font-medium
              ${index === 0 ? 'rounded-l-md' : ''}
              ${index === timeRanges.length - 1 ? 'rounded-r-md' : ''}
              ${selectedTimeRange === range.value 
                ? 'z-10 text-beige-50' 
                : 'text-coffee-600 hover:text-coffee-800'
              }
              focus:z-10 focus:outline-none transition-colors duration-200
            `}
            onClick={() => setSelectedTimeRange(range.value)}
          >
            {selectedTimeRange === range.value && (
              <motion.div
                layoutId="timeRangeIndicator"
                className="absolute inset-0 bg-coffee-600 rounded-md"
                initial={false}
                transition={{ type: "spring", duration: 0.4, bounce: 0.3 }}
              />
            )}
            <span className={`relative ${selectedTimeRange === range.value ? 'text-beige-50' : ''}`}>
              {range.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TimeRangeSelector;