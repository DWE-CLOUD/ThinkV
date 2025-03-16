import { v4 as uuidv4 } from 'uuid';
import { Channel, DataPoint, User } from '../types';
import { subDays, subHours, format, addMinutes } from 'date-fns';

// Mock Users
export const mockUsers: User[] = [
  {
    id: uuidv4(),
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    id: uuidv4(),
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
];

// Mock Channels
export const mockChannels: Channel[] = [
  {
    id: '1',
    name: 'Home Environment Monitor',
    description: 'Tracks temperature, humidity, and air quality in my home',
    userId: mockUsers[0].id,
    isPublic: true,
    tags: ['home', 'environment', 'temperature', 'humidity'],
    createdAt: subDays(new Date(), 30).toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      { id: '1-1', name: 'Temperature', fieldNumber: 1, color: '#FF6384', unit: '°C' },
      { id: '1-2', name: 'Humidity', fieldNumber: 2, color: '#36A2EB', unit: '%' },
      { id: '1-3', name: 'CO2', fieldNumber: 3, color: '#4BC0C0', unit: 'ppm' },
    ],
  },
  {
    id: '2',
    name: 'Solar Panel Performance',
    description: 'Monitors energy production and efficiency of my solar panel installation',
    userId: mockUsers[0].id,
    isPublic: true,
    tags: ['energy', 'solar', 'power', 'sustainability'],
    createdAt: subDays(new Date(), 45).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
    fields: [
      { id: '2-1', name: 'Power Output', fieldNumber: 1, color: '#FFCD56', unit: 'W' },
      { id: '2-2', name: 'Voltage', fieldNumber: 2, color: '#FF9F40', unit: 'V' },
      { id: '2-3', name: 'Current', fieldNumber: 3, color: '#9966FF', unit: 'A' },
      { id: '2-4', name: 'Temperature', fieldNumber: 4, color: '#FF6384', unit: '°C' },
    ],
  },
  {
    id: '3',
    name: 'Office Occupancy',
    description: 'Tracks office occupancy and environmental conditions',
    userId: mockUsers[1].id,
    isPublic: false,
    tags: ['office', 'occupancy', 'environment'],
    createdAt: subDays(new Date(), 15).toISOString(),
    updatedAt: subDays(new Date(), 2).toISOString(),
    fields: [
      { id: '3-1', name: 'People Count', fieldNumber: 1, color: '#C9CBCF', unit: '' },
      { id: '3-2', name: 'Noise Level', fieldNumber: 2, color: '#8C9EFF', unit: 'dB' },
      { id: '3-3', name: 'Light Level', fieldNumber: 3, color: '#FFD700', unit: 'lux' },
    ],
  },
];

// Generate Mock Data Points
export const generateMockDataPoints = (
  channelId: string, 
  hoursBack: number = 24, 
  interval: number = 15
): DataPoint[] => {
  const dataPoints: DataPoint[] = [];
  const channel = mockChannels.find(c => c.id === channelId);
  
  if (!channel) return [];
  
  const startDate = subHours(new Date(), hoursBack);
  
  channel.fields.forEach(field => {
    for (let i = 0; i < (hoursBack * 60) / interval; i++) {
      const timestamp = addMinutes(startDate, i * interval).toISOString();
      
      let value = 0;
      
      // Different data patterns for different fields
      if (field.name === 'Temperature') {
        // Temperature follows a daily cycle with some randomness
        const hour = new Date(timestamp).getHours();
        const baseTemp = hour > 12 ? 25 - (hour - 12) : 18 + hour;
        value = baseTemp + (Math.random() * 4 - 2);
      } else if (field.name === 'Humidity') {
        // Humidity inversely correlates with temperature but with randomness
        const hour = new Date(timestamp).getHours();
        const baseHumidity = hour > 12 ? 40 + (hour - 12) : 60 - hour;
        value = baseHumidity + (Math.random() * 10 - 5);
      } else if (field.name === 'CO2') {
        // CO2 levels change based on fictional occupancy
        const hour = new Date(timestamp).getHours();
        const baseValue = (hour >= 9 && hour <= 17) ? 1000 : 500;
        value = baseValue + (Math.random() * 200 - 100);
      } else if (field.name === 'Power Output') {
        // Solar power follows daylight with peak at noon
        const hour = new Date(timestamp).getHours();
        value = hour >= 6 && hour <= 18 
          ? 1000 * Math.sin(Math.PI * (hour - 6) / 12) + (Math.random() * 100 - 50)
          : Math.random() * 20;
      } else if (field.name === 'Voltage') {
        // Voltage stays relatively stable with minor fluctuations
        value = 220 + (Math.random() * 4 - 2);
      } else if (field.name === 'People Count') {
        // People count follows working hours pattern
        const hour = new Date(timestamp).getHours();
        const dayOfWeek = new Date(timestamp).getDay();
        
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          value = Math.floor(Math.random() * 3); // Weekends
        } else if (hour >= 9 && hour <= 17) {
          value = 15 + Math.floor(Math.random() * 10); // Working hours
        } else {
          value = Math.floor(Math.random() * 5); // Non-working hours
        }
      } else {
        // Default random values for other fields
        value = Math.round(Math.random() * 100);
      }
      
      dataPoints.push({
        id: uuidv4(),
        channelId,
        fieldId: field.id,
        value,
        timestamp,
      });
    }
  });
  
  return dataPoints;
};

// Function to get data for a specific timeframe
export const getChannelData = (channelId: string, timeRange: string): DataPoint[] => {
  let hoursBack = 24;
  
  switch (timeRange) {
    case '1h': hoursBack = 1; break;
    case '6h': hoursBack = 6; break;
    case '24h': hoursBack = 24; break;
    case '7d': hoursBack = 24 * 7; break;
    case '30d': hoursBack = 24 * 30; break;
    case '90d': hoursBack = 24 * 90; break;
    default: hoursBack = 24;
  }
  
  return generateMockDataPoints(channelId, hoursBack);
};

// Function to get current user
export const getCurrentUser = (): User => {
  return mockUsers[0];
};