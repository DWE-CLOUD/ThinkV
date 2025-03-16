import { DataPoint, Field, ChartData } from '../types';
import { format, parseISO } from 'date-fns';

export const prepareChartData = (
  dataPoints: DataPoint[],
  fields: Field[],
  timeRange: string
): ChartData => {
  if (!dataPoints.length || !fields.length) {
    return {
      labels: [],
      datasets: [],
    };
  }

  // Group data points by field
  const dataByField = fields.reduce<Record<string, DataPoint[]>>((acc, field) => {
    acc[field.id] = dataPoints.filter(dp => dp.fieldId === field.id);
    return acc;
  }, {});

  // Get all unique timestamps and sort them
  const allTimestamps = [...new Set(dataPoints.map(dp => dp.timestamp))].sort();

  // Format timestamps for labels based on time range
  const formatTimestamp = (timestamp: string) => {
    const date = parseISO(timestamp);
    if (timeRange === '1h' || timeRange === '6h') {
      return format(date, 'HH:mm');
    } else if (timeRange === '24h') {
      return format(date, 'HH:mm');
    } else if (timeRange === '7d') {
      return format(date, 'EEE HH:mm');
    } else {
      return format(date, 'MMM dd');
    }
  };

  // Format labels based on timestamps
  const labels = allTimestamps.map(formatTimestamp);

  // Create datasets for each field
  const datasets = fields.map(field => {
    const fieldData = dataByField[field.id] || [];
    
    // Create a mapping of timestamp to data point for this field
    const dataByTimestamp = fieldData.reduce<Record<string, number>>((acc, dp) => {
      acc[dp.timestamp] = dp.value;
      return acc;
    }, {});
    
    // Map the values for each timestamp in the complete set
    const data = allTimestamps.map(timestamp => {
      return dataByTimestamp[timestamp] !== undefined ? dataByTimestamp[timestamp] : null;
    });

    return {
      label: field.name,
      data,
      borderColor: field.color,
      backgroundColor: `${field.color}33`, // Add transparency
      tension: 0.4,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: false,
    };
  });

  return {
    labels,
    datasets,
  };
};

// Function to calculate statistics for field data
export const calculateFieldStats = (dataPoints: DataPoint[], fieldId: string) => {
  const fieldData = dataPoints.filter(dp => dp.fieldId === fieldId).map(dp => dp.value);
  
  if (!fieldData.length) {
    return {
      current: null,
      min: null,
      max: null,
      avg: null,
    };
  }

  const current = fieldData[fieldData.length - 1];
  const min = Math.min(...fieldData);
  const max = Math.max(...fieldData);
  const avg = fieldData.reduce((sum, val) => sum + val, 0) / fieldData.length;

  return {
    current,
    min,
    max,
    avg,
  };
};