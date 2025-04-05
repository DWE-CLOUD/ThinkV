import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../context/AppContext';
import { prepareChartData } from '../../utils/chartUtils';
import Card from '../ui/Card';
import Loader from '../ui/Loader';
import TimeRangeSelector from './TimeRangeSelector';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../../utils/supabase';
import { DataPoint } from '../../types';
import { v4 as uuidv4 } from 'uuid';

// FastAPI backend URL
const FASTAPI_BASE_URL = 'https://api.thinkv.space';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChannelChart: React.FC = () => {
  const { selectedChannel, dataPoints, isLoading, selectedTimeRange, setDataPoints, setIsLoading, error, setError } = useAppContext();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [apiData, setApiData] = useState<DataPoint[]>([]);
  const [apiDataLoading, setApiDataLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // Store data in Supabase for persistence
  const storeDataInSupabase = async (dataToStore: DataPoint[]) => {
    if (!dataToStore.length) return;
    
    try {
      // Get batches of 50 data points for more efficient processing
      const batches = [];
      for (let i = 0; i < dataToStore.length; i += 50) {
        batches.push(dataToStore.slice(i, i + 50));
      }
      
      // Process each batch
      for (const batch of batches) {
        console.log("Storing batch of data points in Supabase:", batch);
        
        const formattedPoints = batch.map(point => ({
          // Generate a proper UUID for each data point
          id: uuidv4(),
          channel_id: point.channelId,
          field_id: point.fieldId,
          value: point.value,
          timestamp: point.timestamp,
          created_at: new Date().toISOString()
        }));
        
        const { error } = await supabase
          .from('datapoints')
          .insert(formattedPoints)
          .select();
        
        if (error) {
          console.error('Error storing data in Supabase:', error);
          setSupabaseError(`Failed to store data in Supabase: ${error.message}`);
        }
      }
      
      console.log(`Successfully stored ${dataToStore.length} data points in Supabase`);
      setSupabaseError(null);
    } catch (err) {
      console.error('Error in Supabase operation:', err);
      setSupabaseError(`Exception during Supabase storage: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Function to fetch data from FastAPI
  const fetchDataFromApi = async () => {
    if (!selectedChannel) return;
    
    setApiDataLoading(true);
    setApiError(null);
    setSupabaseError(null);
    
    try {
      // Get channel data
      const url = `${FASTAPI_BASE_URL}/channels/${selectedChannel.id}`;
      console.log(`Attempting to fetch data from API: ${url}`);
      
      // Use a timeout to avoid hanging if the API doesn't respond
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      try {
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        if (response.status === 404) {
          setApiError('This channel exists in the database but has not been synchronized with the IoT backend. Please try refreshing the page or contact support if the issue persists.');
          return;
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
        }
        
        const channelData = await response.json();
        console.log("Channel data:", channelData);
        
        // Process the data from the API
        const allFieldsData: DataPoint[] = [];
        
        // First, extract the current values for each field
        if (channelData.fields) {
          Object.entries(channelData.fields).forEach(([fieldIndex, fieldData]: [string, any]) => {
            const field = selectedChannel.fields.find(f => f.fieldNumber === parseInt(fieldIndex));
            
            if (field && fieldData.value !== undefined) {
              // Create a data point for the current value
              const timestamp = fieldData.last_updated || new Date().toISOString();
              allFieldsData.push({
                // Use a string identifier for frontend tracking only
                id: `frontend-${selectedChannel.id}-${field.id}-${timestamp}`,
                channelId: selectedChannel.id,
                fieldId: field.id,
                value: fieldData.value,
                timestamp,
              });
            }
          });
        }
        
        // Now fetch historical data for each field
        for (const field of selectedChannel.fields) {
          try {
            const historyUrl = `${FASTAPI_BASE_URL}/channels/${selectedChannel.id}/fields/${field.fieldNumber}/data`;
            console.log(`Fetching historical data from: ${historyUrl}`);
            
            const historyResponse = await fetch(historyUrl, {
              signal: controller.signal
            });
            
            if (historyResponse.ok) {
              const historyData = await historyResponse.json();
              
              if (Array.isArray(historyData) && historyData.length > 0) {
                console.log(`Got ${historyData.length} historical data points for field ${field.fieldNumber}`);
                
                // Convert API data to our DataPoint format
                const convertedData = historyData.map((point: any) => ({
                  // Use a string identifier for frontend tracking only
                  id: `frontend-${selectedChannel.id}-${field.id}-${point.timestamp}`,
                  channelId: selectedChannel.id,
                  fieldId: field.id,
                  value: point.value,
                  timestamp: point.timestamp,
                }));
                
                allFieldsData.push(...convertedData);
              } else {
                console.log(`No historical data for field ${field.fieldNumber}`);
              }
            } else {
              console.warn(`Error fetching historical data for field ${field.fieldNumber}: ${historyResponse.statusText}`);
            }
          } catch (fieldError) {
            console.warn(`Failed to fetch historical data for field ${field.fieldNumber}`, fieldError);
            // Continue with other fields even if one fails
          }
        }
        
        // If we have data from the API, use it for the chart and store in Supabase
        if (allFieldsData.length > 0) {
          console.log(`Processing ${allFieldsData.length} data points from API`);
          
          // Remove duplicates based on id
          const uniqueDataMap = new Map<string, DataPoint>();
          allFieldsData.forEach(point => {
            uniqueDataMap.set(point.id, point);
          });
          
          const uniqueData = Array.from(uniqueDataMap.values());
          
          // Sort by timestamp
          uniqueData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          
          setApiData(uniqueData);
          
          // Store in Supabase for persistence
          await storeDataInSupabase(uniqueData);
          
          // Update the UI with this data
          setDataPoints(prev => {
            // Combine with existing data, removing duplicates
            const combined = [...prev];
            uniqueData.forEach(point => {
              if (!combined.some(p => p.id === point.id)) {
                combined.push(point);
              }
            });
            
            // Sort by timestamp
            combined.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            
            return combined;
          });
        } else {
          console.log("No data received from API");
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.warn('API request timed out');
          throw new Error('API request timed out');
        } else {
          throw fetchError;
        }
      }
    } catch (err) {
      console.error('Error fetching data from API:', err);
      setApiError(`Failed to fetch data from API. Using local data instead.`);
      
      // Fall back to existing local data
      console.log("Falling back to local data");
    } finally {
      setApiDataLoading(false);
    }
  };

  // Fetch data from API when channel or time range changes
  useEffect(() => {
    if (selectedChannel) {
      fetchDataFromApi();
    }
  }, [selectedChannel, selectedTimeRange]);

  // Options for the chart
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'start' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          boxHeight: 6,
          padding: 10,
          color: 'rgba(101, 78, 60, 0.9)',
          font: {
            family: "'Inter', sans-serif",
            size: 11
          }
        },
      },
      tooltip: {
        backgroundColor: 'rgba(101, 78, 60, 0.95)',
        titleColor: 'rgba(242, 232, 223, 0.9)',
        bodyColor: 'rgba(242, 232, 223, 0.7)',
        borderColor: 'rgba(242, 232, 223, 0.1)',
        borderWidth: 1,
        padding: 8,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: function(context: any) {
            const field = selectedChannel?.fields.find(f => f.name === context.dataset.label);
            let label = context.dataset.label || '';
            label += ': ' + context.parsed.y;
            if (field?.unit) {
              label += ` ${field.unit}`;
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          color: 'rgba(101, 78, 60, 0.05)'
        },
        ticks: {
          color: 'rgba(101, 78, 60, 0.7)',
          font: {
            size: 10
          },
          maxRotation: 45,
          minRotation: 45,
          maxTicksLimit: 8,
          autoSkip: true
        }
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(101, 78, 60, 0.05)',
        },
        ticks: {
          color: 'rgba(101, 78, 60, 0.7)',
          font: {
            size: 10
          },
          padding: 5,
          precision: 1
        }
      },
    },
    animation: {
      duration: 800,
    },
    layout: {
      padding: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5
      }
    },
    elements: {
      point: {
        radius: 2,
        hoverRadius: 4,
      },
      line: {
        tension: 0.3,
        borderWidth: 2,
      }
    }
  };

  // Prepare chart data by combining API data and data from Supabase
  let chartData;
  if (selectedChannel && (dataPoints.length > 0 || apiData.length > 0) && !isLoading) {
    // Combine data, removing duplicates by ID
    const uniqueDataMap = new Map();
    
    // Process API data first (more recent)
    apiData.forEach(point => {
      uniqueDataMap.set(point.id, point);
    });
    
    // Then add data from Supabase
    dataPoints.forEach(point => {
      if (!uniqueDataMap.has(point.id)) {
        uniqueDataMap.set(point.id, point);
      }
    });
    
    // Convert map back to array and sort by timestamp
    const combinedData = Array.from(uniqueDataMap.values());
    combinedData.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Prepare the chart data
    chartData = prepareChartData(combinedData, selectedChannel.fields, selectedTimeRange);
  }

  // Handle manual refresh
  const refreshData = () => {
    fetchDataFromApi();
  };

  return (
    <Card className="bg-beige-50 border-beige-200 flex flex-col h-[400px]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
        <h2 className="text-lg font-medium text-coffee-800 pl-1">
          {selectedChannel ? selectedChannel.name : 'Select a Channel'}
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <TimeRangeSelector />
          <motion.button
            onClick={refreshData}
            className="p-1.5 rounded-full hover:bg-beige-200 text-coffee-500 hover:text-coffee-700 transition-colors"
            aria-label="Refresh data"
            whileHover={{ scale: 1.1, rotate: 180 }}
            transition={{ duration: 0.4 }}
            disabled={apiDataLoading}
          >
            <RefreshCw size={18} className={apiDataLoading ? "animate-spin" : ""} />
          </motion.button>
        </div>
      </div>

      {apiError && (
        <div className="mb-2 bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-rose-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="flex-1 text-sm">{apiError}</span>
          </div>
        </div>
      )}
      
      {supabaseError && (
        <div className="mb-2 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-md">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="flex-1 text-sm">{supabaseError}</span>
          </div>
        </div>
      )}

      <div className="flex-grow overflow-hidden relative">
        <AnimatePresence mode="wait">
          {isLoading || apiDataLoading ? (
            <motion.div 
              key="loading"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Loader size="lg" color="coffee" />
            </motion.div>
          ) : !selectedChannel ? (
            <motion.div 
              key="no-channel"
              className="absolute inset-0 flex items-center justify-center text-coffee-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              Please select a channel to view data
            </motion.div>
          ) : (!chartData || (!chartData.datasets.some(d => d.data.length > 0))) ? (
            <motion.div 
              key="no-data"
              className="absolute inset-0 flex flex-col items-center justify-center text-coffee-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p>No data available for the selected time range</p>
              <p className="text-sm mt-2">Try using the device simulator to send some data</p>
            </motion.div>
          ) : (
            <motion.div
              key="chart"
              className="w-full h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <Line options={options} data={chartData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default ChannelChart;