import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Cpu, ArrowRight, HelpCircle, Smartphone } from 'lucide-react';
import Header from '../components/layout/Header';
import { useAppContext } from '../context/AppContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import DeviceSimulator from '../components/devices/DeviceSimulator';
import { useParams, useNavigate } from 'react-router-dom';

const SimulatorPage: React.FC = () => {
  const { currentUser, channels } = useAppContext();
  const navigate = useNavigate();
  const { channelId } = useParams<{ channelId?: string }>();
  
  const [selectedChannel, setSelectedChannel] = useState<any>(null);

  useEffect(() => {
    if (channelId && channels.length > 0) {
      const channel = channels.find(c => c.id === channelId);
      if (channel) {
        setSelectedChannel(channel);
      } else {
        // If channel not found, use the first channel or null
        setSelectedChannel(channels[0] || null);
      }
    } else if (channels.length > 0 && !channelId) {
      // If no channel ID provided but channels exist, select the first one
      setSelectedChannel(channels[0]);
    }
  }, [channelId, channels]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-beige-100">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-medium text-coffee-800 mb-4">Please log in to use the device simulator</h2>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-coffee-800">Device Simulator</h1>
          <p className="text-coffee-600">Simulate IoT devices sending data to your channels</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar with channels */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-beige-200">
                <h2 className="text-lg font-medium text-coffee-800">Your Channels</h2>
                <p className="text-sm text-coffee-600">Select a channel to simulate</p>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <ul className="divide-y divide-beige-200">
                  {channels.map(channel => (
                    <li key={channel.id}>
                      <button 
                        onClick={() => setSelectedChannel(channel)}
                        className={`w-full text-left px-4 py-3 hover:bg-beige-100 transition-colors ${
                          selectedChannel?.id === channel.id ? 'bg-beige-100 border-l-4 border-coffee-600' : ''
                        }`}
                      >
                        <div className="font-medium text-coffee-800">{channel.name}</div>
                        <div className="text-xs text-coffee-500 truncate">{channel.description}</div>
                        <div className="text-xs mt-1 text-coffee-400">{channel.fields.length} fields</div>
                      </button>
                    </li>
                  ))}
                </ul>

                {channels.length === 0 && (
                  <div className="p-4 text-center text-coffee-500">
                    <Cpu size={32} className="mx-auto mb-2 text-coffee-400" />
                    <p>No channels created yet</p>
                    <Button 
                      className="mt-2" 
                      size="sm"
                      onClick={() => navigate('/dashboard')}
                      leftIcon={<ArrowRight size={16} />}
                    >
                      Create Channel
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            <Card className="mt-6">
              <div className="p-4 border-b border-beige-200 flex items-center">
                <HelpCircle size={16} className="mr-2 text-coffee-600" />
                <h3 className="text-md font-medium text-coffee-800">About Device Simulator</h3>
              </div>
              <div className="p-4 text-coffee-700 text-sm space-y-3">
                <p>
                  The device simulator allows you to generate test data for your IoT channels without needing actual hardware.
                </p>
                <p>
                  It works by sending HTTP requests to the same API endpoints that your real IoT devices would use.
                </p>
                <p className="font-medium">Features:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Generate random data for any channel</li>
                  <li>Adjust update frequency and variation</li>
                  <li>See API responses in real-time</li>
                  <li>Test your visualization dashboards</li>
                </ul>
                <div className="bg-beige-100 p-3 rounded-md text-xs">
                  <p className="font-medium mb-1">Tip:</p>
                  <p>For actual devices, check the API Documentation page for integration examples.</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Main content */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {selectedChannel ? (
              <DeviceSimulator channel={selectedChannel} />
            ) : (
              <Card className="flex flex-col items-center justify-center p-10 text-center h-96">
                <Smartphone size={48} className="text-coffee-400 mb-4" />
                <h2 className="text-xl font-medium text-coffee-800 mb-2">Select a Channel</h2>
                <p className="text-coffee-600 max-w-md">
                  Choose a channel from the sidebar to begin simulating IoT device data
                </p>
                
                {channels.length === 0 && (
                  <Button 
                    className="mt-6" 
                    onClick={() => navigate('/dashboard')}
                    leftIcon={<ArrowRight size={16} />}
                  >
                    Create Your First Channel
                  </Button>
                )}
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SimulatorPage;