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

// FastAPI backend URL
const FASTAPI_BASE_URL = 'http://82.25.104.223';

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

  // Function to fetch data from FastAPI
  const fetchDataFromApi = async () => {
    if (!selectedChannel) return;
    
    setApiDataLoading(true);
    setApiError(null);
    
    try {
      // Get data for each field from the FastAPI backend
      const allFieldsData: DataPoint[] = [];
      
      for (const field of selectedChannel.fields) {
        const fieldIndex = field.fieldNumber;
        
        console.log(`Fetching data for field ${fieldIndex} from: ${FASTAPI_BASE_URL}/channels/${selectedChannel.id}/fields/${fieldIndex}/data`);
        
        const response = await fetch(`${FASTAPI_BASE_URL}/api/v1/channels/${selectedChannel.id}/fields/${fieldIndex}/data?results=50`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data for field ${fieldIndex}: ${response.statusText}`);
        }
        
        const fieldData = await response.json();
        
        // Convert the data to our DataPoint format
        const convertedData = fieldData.map((point: any) => ({
          id: `${selectedChannel.id}-${field.id}-${point.timestamp}`,
          channelId: selectedChannel.id,
          fieldId: field.id,
          value: point.value,
          timestamp: point.timestamp,
        }));
        
        allFieldsData.push(...convertedData);
        
        // Also store in Supabase for persistence
        await storeDataInSupabase(convertedData);
      }
      
      setApiData(allFieldsData);
      
      // If we have data from the API, use it for the chart
      if (allFieldsData.length > 0) {
        setDataPoints(allFieldsData);
      }
    } catch (err) {
      console.error('Error fetching data from API:', err);
      setApiError(`Failed to fetch data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setApiDataLoading(false);
    }
  };

  // Function to store data in Supabase
  const storeDataInSupabase = async (dataToStore: DataPoint[]) => {
    if (!dataToStore.length) return;
    
    try {
      // Insert data points to Supabase datapoints table
      const { error } = await supabase
        .from('datapoints')
        .upsert(dataToStore.map(point => ({
          id: point.id,
          channel_id: point.channelId,
          field_id: point.fieldId,
          value: point.value,
          timestamp: point.timestamp,
        })));
      
      if (error) {
        console.error('Error storing data in Supabase:', error);
      }
    } catch (err) {
      console.error('Error in Supabase operation:', err);
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
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          color: 'rgba(101, 78, 60, 0.9)',
          font: {
            family: "'Inter', sans-serif",
            size: 12
          }
        },
      },
      tooltip: {
        backgroundColor: 'rgba(101, 78, 60, 0.95)',
        titleColor: 'rgba(242, 232, 223, 0.9)',
        bodyColor: 'rgba(242, 232, 223, 0.7)',
        borderColor: 'rgba(242, 232, 223, 0.1)',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
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
          }
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
          }
        }
      },
    },
    animation: {
      duration: 1000,
    },
  };

  let chartData;
  if (selectedChannel && dataPoints && !isLoading) {
    // Use combined data from API and local
    const combinedData = [...dataPoints, ...apiData].filter((v, i, a) => 
      a.findIndex(t => t.id === v.id) === i
    );
    chartData = prepareChartData(combinedData, selectedChannel.fields, selectedTimeRange);
  }

  const refreshData = () => {
    fetchDataFromApi();
  };

  return (
    <Card className="flex flex-col bg-beige-50 border-beige-200 h-full">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-medium text-coffee-800">
          {selectedChannel ? selectedChannel.name : 'Select a Channel'}
        </h2>
        <div className="flex items-center space-x-2">
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
        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-rose-500 mr-2 flex-shrink-0" />
            <span>{apiError}</span>
          </div>
        </div>
      )}

      <div className="flex-1 relative" ref={chartContainerRef} style={{ minHeight: "400px" }}>
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
          ) : dataPoints.length === 0 && apiData.length === 0 ? (
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
              <Line options={options} data={chartData} height={chartContainerRef.current?.clientHeight || 400} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default ChannelChart;