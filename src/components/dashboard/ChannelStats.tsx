import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';
import { calculateFieldStats } from '../../utils/chartUtils';
import Card from '../ui/Card';
import Loader from '../ui/Loader';
import { TrendingUp, TrendingDown, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { DataPoint } from '../../types';
import { v4 as uuidv4 } from 'uuid';

// FastAPI backend URL
const FASTAPI_BASE_URL = 'https://api.thinkv.space';

const ChannelStats: React.FC = () => {
  const { selectedChannel, dataPoints, isLoading } = useAppContext();
  const [apiStats, setApiStats] = useState<Record<string, any>>({});
  const [apiStatsLoading, setApiStatsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);
  const [localStats, setLocalStats] = useState<Record<string, any>>({});

  const formatValue = (value: number | null | undefined, unit?: string) => {
    if (value === null || value === undefined) return 'N/A';
    return unit ? `${value.toFixed(2)} ${unit}` : value.toFixed(2);
  };

  // Calculate stats from local data
  useEffect(() => {
    if (selectedChannel && dataPoints.length > 0) {
      const stats: Record<string, any> = {};
      
      selectedChannel.fields.forEach(field => {
        stats[field.id] = calculateFieldStats(dataPoints, field.id);
      });
      
      setLocalStats(stats);
    }
  }, [selectedChannel, dataPoints]);

  // Fetch latest field values from the API
  const fetchApiStats = async () => {
    if (!selectedChannel) return;
    
    setApiStatsLoading(true);
    setApiError(null);
    setSupabaseError(null);
    
    try {
      // Get the channel data from the API
      const response = await fetch(`${FASTAPI_BASE_URL}/channels/${selectedChannel.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.status === 404) {
        setApiError('This channel exists in the database but has not been synchronized with the IoT backend. Please try refreshing the page or contact support if the issue persists.');
        setApiStats({});
        return;
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
      }
      
      const channelData = await response.json();
      console.log("Channel data for stats:", channelData);
      
      // Extract field values and store in Supabase
      const stats: Record<string, any> = {};
      const newDataPoints: DataPoint[] = [];
      
      // Process fields from the response
      if (channelData.fields) {
        Object.entries(channelData.fields).forEach(([fieldKey, fieldValue]: [string, any]) => {
          const fieldNumber = parseInt(fieldKey);
          const field = selectedChannel.fields.find(f => f.fieldNumber === fieldNumber);
          
          if (field && fieldValue.value !== undefined) {
            stats[field.id] = {
              current: fieldValue.value,
              lastUpdated: fieldValue.last_updated || new Date().toISOString()
            };
            
            // Create a data point to store in Supabase
            const timestamp = fieldValue.last_updated || new Date().toISOString();
            newDataPoints.push({
              id: `frontend-${selectedChannel.id}-${field.id}-${timestamp}`,
              channelId: selectedChannel.id,
              fieldId: field.id,
              value: fieldValue.value,
              timestamp
            });
          }
        });
      }
      
      console.log("Stats from API:", stats);
      setApiStats(stats);
      
      // Store the data points in Supabase for persistence
      if (newDataPoints.length > 0) {
        try {
          console.log("Attempting to store data points in Supabase:", newDataPoints);
          
          // Convert field names to match DB schema and generate proper UUIDs
          const formattedPoints = newDataPoints.map(point => ({
            // Generate a proper UUID for each data point
            id: uuidv4(),
            channel_id: point.channelId,
            field_id: point.fieldId,
            value: point.value,
            timestamp: point.timestamp
          }));
          
          const { error } = await supabase
            .from('datapoints')
            .insert(formattedPoints);
          
          if (error) {
            console.error('Error storing stats data in Supabase:', error);
            setSupabaseError(`Failed to store data in Supabase: ${error.message}`);
          } else {
            console.log(`Successfully stored ${newDataPoints.length} data points in Supabase`);
          }
        } catch (storageError) {
          console.error('Failed to store stats in Supabase:', storageError);
          setSupabaseError(`Exception during Supabase storage: ${storageError instanceof Error ? storageError.message : 'Unknown error'}`);
        }
      }
    } catch (err) {
      console.error('Error fetching API stats:', err);
      setApiError(`Failed to fetch stats: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setApiStats({});
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
      <Card className="bg-beige-50 border-beige-200 h-[300px]">
        <div className="flex items-center justify-center h-full">
          <p className="text-coffee-500">Select a channel to view statistics</p>
        </div>
      </Card>
    );
  }

  // Check if we have fields defined
  if (!selectedChannel.fields || selectedChannel.fields.length === 0) {
    return (
      <Card className="bg-beige-50 border-beige-200 h-[300px]">
        <div className="flex flex-col items-center justify-center h-full">
          <AlertTriangle size={24} className="text-amber-500 mb-2" />
          <p className="text-coffee-600">No fields defined for this channel</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-beige-50 border-beige-200 flex flex-col h-[300px]">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-medium text-coffee-800 pl-1">Channel Statistics</h2>
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
        <div className="mb-2 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-rose-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="flex-1 text-sm">{apiError}</span>
          </div>
        </div>
      )}
      
      {supabaseError && (
        <div className="mb-2 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="flex-1 text-sm">{supabaseError}</span>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {isLoading || apiStatsLoading ? (
          <motion.div 
            key="loading"
            className="flex-grow flex items-center justify-center"
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
            className="flex-grow flex flex-col items-center justify-center text-coffee-500"
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
          <div className="flex-grow overflow-auto">
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-1 pr-1"
              variants={container}
              initial="hidden"
              animate="show"
              key="stats-grid"
            >
              {selectedChannel.fields.map(field => {
                const localStat = localStats[field.id] || { min: null, max: null, avg: null, current: null };
                const apiStat = apiStats[field.id] || {};
                const trend = getTrendValue(field.id);
                
                // Use API current value if available, otherwise fall back to calculated stats
                const currentValue = apiStat?.current !== undefined ? apiStat.current : localStat.current;
                
                return (
                  <motion.div
                    key={field.id}
                    className="border border-beige-200 rounded-lg p-2 bg-gradient-to-r from-beige-50 to-beige-100"
                    variants={item}
                    whileHover={{ scale: 1.01, boxShadow: "0 4px 6px -1px rgba(101, 78, 60, 0.1), 0 2px 4px -1px rgba(101, 78, 60, 0.06)" }}
                    style={{
                      borderLeftWidth: '3px',
                      borderLeftColor: field.color || '#c4a389'
                    }}
                  >
                    <h3 className="font-medium text-coffee-800 mb-1.5 flex items-center text-sm">
                      <span
                        className="inline-block w-2 h-2 rounded-full mr-1.5"
                        style={{ backgroundColor: field.color || '#c4a389' }}
                      ></span>
                      <span className="truncate max-w-[150px]">{field.name || 'Unnamed Field'}</span>
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-coffee-500 mb-0.5">Current</p>
                        <div className="flex items-end space-x-1">
                          <p className="text-base font-semibold text-coffee-800 truncate">
                            {formatValue(currentValue, field.unit)}
                          </p>
                          <motion.div 
                            className={`flex items-center text-xs ${trend.isUp ? 'text-emerald-600' : 'text-rose-600'}`}
                            initial={{ x: -5, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                          >
                            {trend.isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                            <span className="ml-0.5">{trend.value.toFixed(1)}%</span>
                          </motion.div>
                        </div>
                        {apiStat?.lastUpdated && (
                          <p className="text-xs text-coffee-500 truncate text-[10px]">
                            Updated: {new Date(apiStat.lastUpdated).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-coffee-500 mb-0.5">Average</p>
                        <p className="text-sm font-medium text-coffee-800 truncate">
                          {formatValue(localStat.avg, field.unit)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-coffee-500 mb-0.5">Min</p>
                        <div className="text-coffee-700">
                          <p className="text-xs truncate">
                            {formatValue(localStat.min, field.unit)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-coffee-500 mb-0.5">Max</p>
                        <div className="text-coffee-700">
                          <p className="text-xs truncate">
                            {formatValue(localStat.max, field.unit)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default ChannelStats;