import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Trash2, Smartphone, Database } from 'lucide-react';
import { DeviceSimulator as DeviceSimulatorClass } from '../../utils/deviceSimulator';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Channel } from '../../types';

interface DeviceSimulatorProps {
  channel: Channel;
}

const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({ channel }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [updateInterval, setUpdateInterval] = useState(5000); // 5 seconds default
  const [variation, setVariation] = useState(10); // 10% variation default
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const simulatorRef = useRef<DeviceSimulatorClass | null>(null);
  const logsEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (simulatorRef.current) {
        simulatorRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom of logs
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const handleStart = () => {
    if (simulatorRef.current && simulatorRef.current.isRunning()) {
      simulatorRef.current.stop();
      setIsRunning(false);
      return;
    }

    setSimulationError(null);

    // Create a new simulator instance
    simulatorRef.current = new DeviceSimulatorClass({
      channelId: channel.id,
      apiKey: channel.apiKey || '',
      interval: updateInterval,
      fields: channel.fields,
      variation,
      randomize: true,
      onUpdate: (data) => {
        // Add a timestamp to the log entry
        setLogs(prev => [...prev.slice(-49), { ...data, timestamp: new Date().toISOString() }]);
        setSimulationError(null);
      },
      onError: (error) => {
        setLogs(prev => [...prev.slice(-49), { error: error.message, timestamp: new Date().toISOString() }]);
        setSimulationError(error.message);
      }
    });

    // Start the simulator
    simulatorRef.current.start();
    setIsRunning(true);
  };

  const clearLogs = () => {
    setLogs([]);
    setSimulationError(null);
  };

  return (
    <Card className="bg-beige-50 border-beige-200">
      <div className="p-5 border-b border-beige-200 flex justify-between items-center">
        <div className="flex items-center">
          <Smartphone className="w-5 h-5 text-coffee-600 mr-2" />
          <h3 className="text-lg font-medium text-coffee-800">Device Simulator</h3>
        </div>
        <Button
          variant={isRunning ? "danger" : "primary"}
          size="sm"
          leftIcon={isRunning ? <Pause size={16} /> : <Play size={16} />}
          onClick={handleStart}
        >
          {isRunning ? 'Stop' : 'Start Simulation'}
        </Button>
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1">
              Update Interval (ms)
            </label>
            <input
              type="number"
              min="1000"
              step="1000"
              disabled={isRunning}
              value={updateInterval}
              onChange={(e) => setUpdateInterval(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-beige-100 border border-beige-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 text-coffee-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-coffee-700 mb-1">
              Value Variation (%)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              disabled={isRunning}
              value={variation}
              onChange={(e) => setVariation(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-beige-100 border border-beige-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 text-coffee-800"
            />
          </div>
        </div>

        {simulationError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-md">
            <div className="flex items-start">
              <Trash2 size={16} className="text-rose-500 mr-2 mt-1" />
              <div>
                <p className="font-medium">Simulation Error</p>
                <p className="text-sm">{simulationError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-beige-200 pt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-md font-medium text-coffee-800 flex items-center">
              <Database className="w-4 h-4 mr-1 text-coffee-600" />
              Data Logs
            </h4>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Trash2 size={14} />}
              onClick={clearLogs}
              disabled={logs.length === 0}
            >
              Clear
            </Button>
          </div>

          <div className="bg-coffee-800 text-beige-100 rounded-md h-64 overflow-y-auto p-3 font-mono text-xs">
            <AnimatePresence initial={false}>
              {logs.length === 0 ? (
                <div className="text-coffee-400 italic text-center py-4">
                  No data yet. Start the simulator to see logs.
                </div>
              ) : (
                logs.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`py-1 border-b border-coffee-700 ${log.error ? 'text-rose-400' : ''}`}
                  >
                    <span className="text-beige-300">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                    {log.error ? (
                      <span>Error: {log.error}</span>
                    ) : (
                      <span>
                        Sent:{' '}
                        {Object.entries(log.data).map(([key, value]) => (
                          <span key={key}>
                            {key}={value}{' '}
                          </span>
                        ))}
                        → Response: {JSON.stringify(log.result)}
                      </span>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
            <div ref={logsEndRef} />
          </div>
        </div>

        <div className="bg-beige-100 p-3 rounded-md text-sm text-coffee-700">
          <p>
            This simulator will send random data to your channel every {updateInterval / 1000} seconds with {variation}% variation.
            Data will be sent directly to the ThinkV API using the channel's API key.
          </p>
          <p className="mt-2 text-xs">
            <strong>API Endpoint:</strong> {`https://api.thinkv.space/channels/${channel.id}`}<br />
            <strong>API Key:</strong> {channel.apiKey ? (channel.apiKey.length > 10 ? channel.apiKey.substring(0, 10) + '...' : channel.apiKey) : 'No API key available'}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default DeviceSimulator;
