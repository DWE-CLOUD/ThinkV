import { Channel } from '../types';

type SimulateOptions = {
  channelId: string;
  apiKey: string;
  interval: number; // in milliseconds
  fields: { id: string; name: string; fieldNumber: number }[];
  randomize?: boolean;
  baseValues?: Record<string, number>;
  variation?: number; // percentage of variation, e.g. 10 for ±10%
  onUpdate?: (data: any) => void;
  onError?: (error: Error) => void;
}

// FastAPI backend URL
const FASTAPI_BASE_URL = 'https://api.dwoscloud.shop';

export class DeviceSimulator {
  private intervalId: number | null = null;
  private options: SimulateOptions;
  private baseValues: Record<string, number>;
  private iteration: number = 0;
  private apiUrl: string;

  constructor(options: SimulateOptions) {
    this.options = options;
    
    // Set default base values if not provided
    this.baseValues = options.baseValues || {};
    options.fields.forEach((field) => {
      const fieldIndex = field.fieldNumber;
      if (this.baseValues[`field${fieldIndex}`] === undefined) {
        // Generate some reasonable defaults based on field name
        const name = field.name.toLowerCase();
        if (name.includes('temp')) {
          this.baseValues[`field${fieldIndex}`] = 22; // room temperature in C
        } else if (name.includes('humid')) {
          this.baseValues[`field${fieldIndex}`] = 45; // humidity percentage
        } else if (name.includes('press')) {
          this.baseValues[`field${fieldIndex}`] = 1013; // atmospheric pressure in hPa
        } else if (name.includes('battery') || name.includes('power')) {
          this.baseValues[`field${fieldIndex}`] = 95; // battery percentage
        } else {
          this.baseValues[`field${fieldIndex}`] = 50 * Math.random(); // random value between 0-50
        }
      }
    });

    // Default variation ±5%
    if (!options.variation) {
      this.options.variation = 5;
    }

    // Set the API URL to use the FastAPI backend - updated to new format
    this.apiUrl = `${FASTAPI_BASE_URL}/update`;
  }

  start(): void {
    if (this.intervalId !== null) {
      console.warn('Device simulator is already running');
      return;
    }

    this.iteration = 0;
    this.sendData(); // Send data immediately on start

    // Set up the interval
    this.intervalId = window.setInterval(() => {
      this.sendData();
    }, this.options.interval);
  }

  stop(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private generateData(): Record<string, number> {
    const data: Record<string, number> = {};
    
    this.options.fields.forEach(field => {
      const fieldIndex = field.fieldNumber;
      const baseValue = this.baseValues[`field${fieldIndex}`] || 0;
      
      let value: number;
      
      if (this.options.randomize) {
        // Calculate variation range
        const variationAmount = baseValue * (this.options.variation! / 100);
        // Generate random value within range
        value = baseValue + (Math.random() * 2 - 1) * variationAmount;
      } else {
        // Generate a sine wave pattern
        const period = 10; // complete cycle every 10 iterations
        const amplitude = baseValue * (this.options.variation! / 100);
        value = baseValue + amplitude * Math.sin((this.iteration % period) / period * 2 * Math.PI);
      }
      
      // Round to 2 decimal places
      data[`field${fieldIndex}`] = Math.round(value * 100) / 100;
    });
    
    this.iteration++;
    return data;
  }

  private async sendData(): Promise<void> {
    const data = this.generateData();
    
    try {
      console.log(`Sending data to FastAPI: ${this.apiUrl}`);
      
      // Construct URL with parameters for the GET request
      const params = new URLSearchParams({
        channel_id: this.options.channelId,
        api_key: this.options.apiKey,
        ...Object.fromEntries(Object.entries(data))
      });
      
      const url = `${this.apiUrl}?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      
      if (this.options.onUpdate) {
        this.options.onUpdate({
          data,
          result,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error sending data to FastAPI:', error);
      if (this.options.onError && error instanceof Error) {
        this.options.onError(error);
      }
    }
  }

  isRunning(): boolean {
    return this.intervalId !== null;
  }
}

// Helper function to quickly create a simulator
export function createSimulator(channel: Channel, onUpdate?: (data: any) => void): DeviceSimulator {
  return new DeviceSimulator({
    channelId: channel.id,
    apiKey: channel.apiKey || '',
    interval: 5000, // 5 seconds
    fields: channel.fields,
    randomize: true,
    onUpdate
  });
}
