import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart2, 
  Download, 
  Clock, 
  Calendar, 
  RefreshCw,
  ChevronLeft,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../utils/supabase';
import { Channel, DataPoint } from '../types';
import { prepareChartData } from '../utils/chartUtils';
import { Line } from 'react-chartjs-2';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const PublicChannelView: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('24h');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Fetch the channel data
  useEffect(() => {
    const fetchChannel = async () => {
      if (!channelId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch channel
        const { data: channelData, error: channelError } = await supabase
          .from('channels')
          .select('*')
          .eq('id', channelId)
          .eq('is_public', true) // Only fetch public channels
          .single();
        
        if (channelError) {
          throw new Error('Channel not found or is not public');
        }
        
        // Convert to Channel type
        const fetchedChannel: Channel = {
          id: channelData.id,
          name: channelData.name,
          description: channelData.description || '',
          userId: channelData.user_id,
          isPublic: channelData.is_public,
          tags: channelData.tags || [],
          createdAt: channelData.created_at,
          updatedAt: channelData.updated_at,
          fields: channelData.fields || [],
        };
        
        setChannel(fetchedChannel);
        
        // Fetch data points
        let hoursBack = 24;
        switch (timeRange) {
          case '1h': hoursBack = 1; break;
          case '6h': hoursBack = 6; break;
          case '24h': hoursBack = 24; break;
          case '7d': hoursBack = 24 * 7; break;
          case '30d': hoursBack = 24 * 30; break;
        }
        
        const fromDate = new Date();
        fromDate.setHours(fromDate.getHours() - hoursBack);
        
        const { data: dataPointsData, error: dataPointsError } = await supabase
          .from('datapoints')
          .select('*')
          .eq('channel_id', channelId)
          .gte('timestamp', fromDate.toISOString())
          .order('timestamp', { ascending: true });
        
        if (dataPointsError) {
          console.error('Error fetching data points:', dataPointsError);
          // Don't throw here - we still want to show the channel even without data
        } else {
          // Convert to DataPoint type
          const fetchedDataPoints: DataPoint[] = dataPointsData.map(dp => ({
            id: dp.id,
            channelId: dp.channel_id,
            fieldId: dp.field_id,
            value: dp.value,
            timestamp: dp.timestamp,
          }));
          
          setDataPoints(fetchedDataPoints);
          
          // Set last updated time
          if (fetchedDataPoints.length > 0) {
            const latestPoint = fetchedDataPoints.reduce((latest, point) => {
              return new Date(point.timestamp) > new Date(latest.timestamp) ? point : latest;
            }, fetchedDataPoints[0]);
            
            setLastUpdated(latestPoint.timestamp);
          }
        }
      } catch (err) {
        console.error('Error fetching channel:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChannel();
  }, [channelId, timeRange]);

  // Handle refreshing data
  const handleRefresh = () => {
    if (channelId) {
      // Re-fetch data with the current time range
      const fetchData = async () => {
        setIsLoading(true);
        
        try {
          let hoursBack = 24;
          switch (timeRange) {
            case '1h': hoursBack = 1; break;
            case '6h': hoursBack = 6; break;
            case '24h': hoursBack = 24; break;
            case '7d': hoursBack = 24 * 7; break;
            case '30d': hoursBack = 24 * 30; break;
          }
          
          const fromDate = new Date();
          fromDate.setHours(fromDate.getHours() - hoursBack);
          
          const { data: dataPointsData, error: dataPointsError } = await supabase
            .from('datapoints')
            .select('*')
            .eq('channel_id', channelId)
            .gte('timestamp', fromDate.toISOString())
            .order('timestamp', { ascending: true });
          
          if (dataPointsError) {
            console.error('Error refreshing data points:', dataPointsError);
          } else {
            // Convert to DataPoint type
            const fetchedDataPoints: DataPoint[] = dataPointsData.map(dp => ({
              id: dp.id,
              channelId: dp.channel_id,
              fieldId: dp.field_id,
              value: dp.value,
              timestamp: dp.timestamp,
            }));
            
            setDataPoints(fetchedDataPoints);
            
            // Update last updated time
            if (fetchedDataPoints.length > 0) {
              const latestPoint = fetchedDataPoints.reduce((latest, point) => {
                return new Date(point.timestamp) > new Date(latest.timestamp) ? point : latest;
              }, fetchedDataPoints[0]);
              
              setLastUpdated(latestPoint.timestamp);
            }
          }
        } catch (err) {
          console.error('Error refreshing data:', err);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchData();
    }
  };

  // Prepare chart data
  const chartData = React.useMemo(() => {
    if (channel && dataPoints.length > 0) {
      return prepareChartData(dataPoints, channel.fields, timeRange);
    }
    return null;
  }, [channel, dataPoints, timeRange]);

  // Chart options
  const chartOptions = {
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
            const field = channel?.fields.find(f => f.name === context.dataset.label);
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

  return (
    <div className="min-h-screen bg-beige-100">
      {/* Simple header for public view */}
      <header className="bg-beige-100 border-b border-beige-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <BarChart2 className="text-coffee-600 mr-2" />
              <h1 className="text-xl font-bold text-coffee-800">ThinkV</h1>
            </div>
            <Link to="/" className="text-coffee-600 hover:text-coffee-800 flex items-center">
              <ChevronLeft size={16} className="mr-1" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-600"></div>
          </div>
        ) : error ? (
          <Card className="p-8 flex flex-col items-center justify-center">
            <AlertCircle size={48} className="text-rose-500 mb-4" />
            <h2 className="text-xl font-semibold text-coffee-800 mb-2">Channel Not Found</h2>
            <p className="text-coffee-600 mb-6">{error}</p>
            <Link to="/">
              <Button>
                Return to Home
              </Button>
            </Link>
          </Card>
        ) : (
          <>
            {/* Channel Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-coffee-800">{channel?.name}</h1>
                  <p className="text-coffee-600">{channel?.description}</p>
                </div>
                <div className="flex items-center space-x-2 mt-4 md:mt-0">
                  {lastUpdated && (
                    <div className="text-sm text-coffee-500 flex items-center bg-beige-200 px-3 py-1.5 rounded-md">
                      <Clock size={14} className="mr-1.5" />
                      Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<RefreshCw size={16} />}
                    onClick={handleRefresh}
                    className="whitespace-nowrap"
                  >
                    Refresh
                  </Button>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {channel?.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-coffee-100 text-coffee-700"
                  >
                    {tag}
                  </span>
                ))}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                  Public
                </span>
              </div>
              
              {/* Time range selector */}
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="text-sm text-coffee-600 flex items-center">
                  <Calendar size={14} className="mr-1.5" />
                  Time Range:
                </div>
                <div className="flex space-x-1 bg-beige-200 p-1 rounded-md">
                  {['1h', '6h', '24h', '7d', '30d'].map((range) => (
                    <button
                      key={range}
                      className={`px-2.5 py-1 text-xs font-medium rounded ${
                        timeRange === range 
                          ? 'bg-coffee-600 text-white' 
                          : 'text-coffee-600 hover:bg-beige-300'
                      }`}
                      onClick={() => setTimeRange(range)}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Chart */}
            <Card className="mb-6">
              <h2 className="text-lg font-medium text-coffee-800 mb-4">Data Visualization</h2>
              <div className="h-[400px] relative">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coffee-600"></div>
                  </div>
                ) : dataPoints.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-coffee-500">
                    No data available for the selected time range
                  </div>
                ) : chartData ? (
                  <Line options={chartOptions} data={chartData} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-coffee-500">
                    Failed to prepare chart data
                  </div>
                )}
              </div>
            </Card>
            
            {/* Field Stats */}
            <Card>
              <h2 className="text-lg font-medium text-coffee-800 mb-4">Channel Fields</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {channel?.fields.map(field => {
                  // Calculate field stats
                  const fieldDataPoints = dataPoints.filter(dp => dp.fieldId === field.id);
                  const values = fieldDataPoints.map(dp => dp.value);
                  
                  let min = null;
                  let max = null;
                  let avg = null;
                  let current = null;
                  
                  if (values.length > 0) {
                    min = Math.min(...values);
                    max = Math.max(...values);
                    avg = values.reduce((sum, val) => sum + val, 0) / values.length;
                    
                    // Get latest value
                    const latestPoint = fieldDataPoints.reduce((latest, point) => {
                      return new Date(point.timestamp) > new Date(latest.timestamp) ? point : latest;
                    }, fieldDataPoints[0]);
                    
                    current = latestPoint.value;
                  }
                  
                  const formatValue = (value: number | null) => {
                    if (value === null) return 'N/A';
                    return field.unit ? `${value.toFixed(2)} ${field.unit}` : value.toFixed(2);
                  };
                  
                  return (
                    <div 
                      key={field.id} 
                      className="border border-beige-200 rounded-lg p-4"
                      style={{ borderLeftWidth: '4px', borderLeftColor: field.color }}
                    >
                      <h3 className="font-medium text-coffee-800 mb-2">{field.name}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs text-coffee-500">Current</div>
                          <div className="text-lg font-semibold text-coffee-800">{formatValue(current)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-coffee-500">Average</div>
                          <div className="text-sm font-medium text-coffee-700">{formatValue(avg)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-coffee-500">Min</div>
                          <div className="text-sm text-coffee-700">{formatValue(min)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-coffee-500">Max</div>
                          <div className="text-sm text-coffee-700">{formatValue(max)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-beige-100 border-t border-beige-200 py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center text-coffee-500 text-sm">
            <p>Data provided through ThinkV's public channel sharing</p>
            <p className="mt-2">&copy; {new Date().getFullYear()} ThinkV. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicChannelView;