import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';
import { calculateFieldStats } from '../../utils/chartUtils';
import Card from '../ui/Card';
import Loader from '../ui/Loader';
import { TrendingUp, TrendingDown, AlertTriangle, RefreshCw } from 'lucide-react';

// FastAPI backend URL
const FASTAPI_BASE_URL = 'http://82.25.104.223';

const ChannelStats: React.FC = () => {
  const { selectedChannel, dataPoints, isLoading } = useAppContext();
  const [apiStats, setApiStats] = useState<Record<string, any>>({});
  const [apiStatsLoading, setApiStatsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const formatValue = (value: number | null, unit?: string) => {
    if (value === null) return 'N/A';
    return unit ? `${value.toFixed(2)} ${unit}` : value.toFixed(2);
  };

  // Fetch latest field values from the API
  const fetchApiStats = async () => {
    if (!selectedChannel) return;
    
    setApiStatsLoading(true);
    setApiError(null);
    
    try {
      // Get the channel data from the API
      const response = await fetch(`${FASTAPI_BASE_URL}/api/v1/channels/${selectedChannel.id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch channel data: ${response.statusText}`);
      }
      
      const channelData = await response.json();
      
      // Extract field values
      const stats: Record<string, any> = {};
      
      // Map FastAPI field values to our format
      Object.entries(channelData.fields || {}).forEach(([fieldIndex, fieldData]: [string, any]) => {
        const field = selectedChannel.fields.find(f => f.fieldNumber === parseInt(fieldIndex));
        if (field) {
          stats[field.id] = {
            current: fieldData.value,
            lastUpdated: fieldData.last_updated
          };
        }
      });
      
      setApiStats(stats);
    } catch (err) {
      console.error('Error fetching API stats:', err);
      setApiError(`Failed to fetch stats: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setApiStatsLoading(false);
    }
  };

  // Fetch API stats when channel changes
  useEffect(() => {
    if (selectedChannel) {
      fetchApiStats();
    }
  }, [selectedChannel]);

  // Generate mock trend percentages for demonstration
  const getTrendValue = (fieldId: string): { value: number; isUp: boolean } => {
    // Using fieldId as seed for deterministic but "random" looking values
    const seed = parseInt(fieldId.replace(/\D/g, '')) || 1;
    const value = ((seed * 17) % 18) / 2 + 1; // Value between 1 and 10
    const isUp = seed % 2 === 0;
    return { value, isUp };
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (!selectedChannel) {
    return (
      <Card className="h-full flex items-center justify-center bg-beige-50 border-beige-200">
        <p className="text-coffee-500">Select a channel to view statistics</p>
      </Card>
    );
  }

  // Check if we have fields defined
  if (!selectedChannel.fields || selectedChannel.fields.length === 0) {
    return (
      <Card className="h-full flex flex-col items-center justify-center bg-beige-50 border-beige-200">
        <AlertTriangle size={24} className="text-amber-500 mb-2" />
        <p className="text-coffee-600">No fields defined for this channel</p>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-beige-50 border border-beige-200 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-coffee-800">Channel Statistics</h2>
        <motion.button
          onClick={fetchApiStats}
          className="p-1.5 rounded-full hover:bg-beige-200 text-coffee-500 hover:text-coffee-700 transition-colors"
          aria-label="Refresh stats"
          whileHover={{ scale: 1.1, rotate: 180 }}
          transition={{ duration: 0.4 }}
          disabled={apiStatsLoading}
        >
          <RefreshCw size={18} className={apiStatsLoading ? "animate-spin" : ""} />
        </motion.button>
      </div>
      
      {apiError && (
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-rose-500 mr-2 flex-shrink-0" />
            <span>{apiError}</span>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {isLoading || apiStatsLoading ? (
          <motion.div 
            key="loading"
            className="h-40 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Loader size="lg" color="coffee" />
          </motion.div>
        ) : dataPoints.length === 0 && Object.keys(apiStats).length === 0 ? (
          <motion.div 
            key="no-data"
            className="h-40 flex flex-col items-center justify-center text-coffee-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AlertTriangle size={24} className="text-amber-500 mb-2" />
            <p>No data available for this channel</p>
            <p className="text-sm mt-1">Try changing the time range or updating your device</p>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            variants={container}
            initial="hidden"
            animate="show"
            key="stats-grid"
          >
            {selectedChannel.fields.map(field => {
              const stats = calculateFieldStats(dataPoints, field.id);
              const apiStat = apiStats[field.id];
              const trend = getTrendValue(field.id);
              
              // Use API current value if available, otherwise fall back to calculated stats
              const currentValue = apiStat?.current !== undefined ? apiStat.current : stats.current;
              
              return (
                <motion.div
                  key={field.id}
                  className="border border-beige-200 rounded-lg p-4 bg-gradient-to-r from-beige-50 to-beige-100"
                  variants={item}
                  whileHover={{ scale: 1.02, boxShadow: "0 4px 6px -1px rgba(101, 78, 60, 0.1), 0 2px 4px -1px rgba(101, 78, 60, 0.06)" }}
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: field.color || '#c4a389'
                  }}
                >
                  <h3 className="font-medium text-coffee-800 mb-3 flex items-center">
                    <span
                      className="inline-block w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: field.color || '#c4a389' }}
                    ></span>
                    {field.name || 'Unnamed Field'}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-coffee-500">Current</p>
                      <div className="flex items-end space-x-2">
                        <p className="text-xl font-semibold text-coffee-800">
                          {formatValue(currentValue, field.unit)}
                        </p>
                        <motion.div 
                          className={`flex items-center text-xs ${trend.isUp ? 'text-emerald-600' : 'text-rose-600'}`}
                          initial={{ x: -5, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          {trend.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          <span className="ml-1">{trend.value.toFixed(1)}%</span>
                        </motion.div>
                      </div>
                      {apiStat?.lastUpdated && (
                        <p className="text-xs text-coffee-500 mt-1">
                          Updated: {new Date(apiStat.lastUpdated).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-coffee-500">Average</p>
                      <p className="text-lg font-medium text-coffee-800">
                        {formatValue(stats.avg, field.unit)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-coffee-500">Min</p>
                      <div className="flex items-center text-coffee-700">
                        <p className="text-base">
                          {formatValue(stats.min, field.unit)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-coffee-500">Max</p>
                      <div className="flex items-center text-coffee-700">
                        <p className="text-base">
                          {formatValue(stats.max, field.unit)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mini sparkline visualization */}
                  <div className="mt-3 h-6 flex items-end space-x-0.5">
                    {[...Array(15)].map((_, i) => {
                      // Generate a deterministic but varied pattern
                      const height = 30 + Math.sin((i + parseInt(field.id.replace(/\D/g, ''))) * 0.5) * 30;
                      return (
                        <motion.div 
                          key={i} 
                          className="w-1 rounded-t"
                          style={{ 
                            backgroundColor: i === 14 ? field.color || '#c4a389' : `${field.color || '#c4a389'}40`
                          }}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ duration: 0.4, delay: 0.1 * i }}
                        ></motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default ChannelStats;