export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  userId: string;
  isPublic: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  fields: Field[];
  apiKey?: string;
}

export interface Field {
  id: string;
  name: string;
  fieldNumber: number;
  color: string;
  unit?: string;
}

export interface DataPoint {
  id: string;
  channelId: string;
  fieldId: string;
  value: number;
  timestamp: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    tension: number;
  }[];
}

export type TimeRange = '1h' | '6h' | '24h' | '7d' | '30d' | '90d' | 'custom';