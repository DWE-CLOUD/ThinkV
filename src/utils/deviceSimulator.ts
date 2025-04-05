// src/utils/deviceSimulator.ts

interface DeviceSimulatorOptions {
  channelId: string;
  apiKey: string;
  interval: number;
  fields: { [key: string]: number };
  variation: number;
  randomize: boolean;
  onUpdate: (data: any) => void;
  onError: (error: Error) => void;
}

export class DeviceSimulator {
  private channelId: string;
  private apiKey: string;
  private interval: number;
  private fields: { [key: string]: number };
  private variation: number;
  private randomize: boolean;
  private onUpdate: (data: any) => void;
  private onError: (error: Error) => void;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private running: boolean = false;

  constructor(options: DeviceSimulatorOptions) {
    this.channelId = options.channelId;
    this.apiKey = options.apiKey;
    this.interval = options.interval;
    this.fields = options.fields;
    this.variation = options.variation;
    this.randomize = options.randomize;
    this.onUpdate = options.onUpdate;
    this.onError = options.onError;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.timerId = setInterval(() => {
      try {
        const data = this.generateData();
        const result = { status: 'success', dataSent: data };
        // Send update with generated data
        this.onUpdate({ data, result, timestamp: new Date().toISOString() });
      } catch (error: any) {
        this.onError(error);
      }
    }, this.interval);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
      this.running = false;
    }
  }

  isRunning() {
    return this.running;
  }

  private generateData() {
    const data: { [key: string]: number } = {};
    for (const key in this.fields) {
      if (Object.prototype.hasOwnProperty.call(this.fields, key)) {
        const baseValue = this.fields[key];
        const variationFactor = this.variation / 100;
        const randomFactor = this.randomize ? 1 + (Math.random() * 2 - 1) * variationFactor : 1;
        data[key] = Number((baseValue * randomFactor).toFixed(2));
      }
    }
    return data;
  }
}
