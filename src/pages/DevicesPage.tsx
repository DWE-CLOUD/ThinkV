import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Smartphone, Laptop, Tablet, Cpu, Plus, Wifi, Zap, ToggleLeft, Trash2, AlertCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import { useAppContext } from '../context/AppContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

// Mock data for devices
const MOCK_DEVICES = [
  {
    id: 'device-1',
    name: 'Living Room Sensor',
    type: 'sensor',
    icon: <Cpu />,
    status: 'online',
    lastSeen: '2 minutes ago',
    firmware: 'v1.2.3',
    battery: 85,
    channels: ['Home Environment Monitor']
  },
  {
    id: 'device-2',
    name: 'Solar Panel Monitor',
    type: 'sensor',
    icon: <Zap />,
    status: 'online',
    lastSeen: 'Just now',
    firmware: 'v2.0.1',
    battery: null, // Wired device
    channels: ['Solar Panel Performance']
  },
  {
    id: 'device-3',
    name: 'Office Presence Sensor',
    type: 'sensor',
    icon: <Wifi />,
    status: 'offline',
    lastSeen: '3 days ago',
    firmware: 'v1.1.0',
    battery: 12,
    channels: ['Office Occupancy']
  },
  {
    id: 'device-4',
    name: 'Mobile App',
    type: 'app',
    icon: <Smartphone />,
    status: 'online',
    lastSeen: 'Just now',
    firmware: 'v3.1.5',
    battery: 64,
    channels: []
  },
  {
    id: 'device-5',
    name: 'Web Dashboard',
    type: 'app',
    icon: <Laptop />,
    status: 'online',
    lastSeen: 'Just now',
    firmware: null,
    battery: null,
    channels: []
  }
];

const DevicesPage: React.FC = () => {
  const { currentUser } = useAppContext();
  const [devices, setDevices] = useState(MOCK_DEVICES);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const getBatteryColor = (level: number | null) => {
    if (level === null) return 'text-gray-400';
    if (level < 20) return 'text-rose-500';
    if (level < 50) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const handleDeleteDevice = (deviceId: string) => {
    setDevices(devices.filter(device => device.id !== deviceId));
    setShowDeleteConfirm(null);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-beige-100">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-medium text-coffee-800 mb-4">Please log in to view your devices</h2>
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
          <h1 className="text-2xl font-bold text-coffee-800">Your Devices</h1>
          <p className="text-coffee-600">Manage connected devices and sensors</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar with menu */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="overflow-hidden">
              <ul className="divide-y divide-beige-200">
                <li>
                  <a 
                    href="/profile" 
                    className="flex items-center px-6 py-4 hover:bg-beige-100 text-coffee-700 hover:text-coffee-800"
                  >
                    <User className="mr-3 h-5 w-5 text-coffee-500" />
                    Profile Information
                  </a>
                </li>
                <li>
                  <a 
                    href="/settings" 
                    className="flex items-center px-6 py-4 hover:bg-beige-100 text-coffee-700 hover:text-coffee-800"
                  >
                    <Settings className="mr-3 h-5 w-5 text-coffee-500" />
                    Account Settings
                  </a>
                </li>
                <li>
                  <a 
                    href="/devices" 
                    className="flex items-center px-6 py-4 bg-beige-100 border-l-4 border-coffee-600 text-coffee-800 font-medium"
                  >
                    <Smartphone className="mr-3 h-5 w-5 text-coffee-600" />
                    Devices
                  </a>
                </li>
              </ul>
            </Card>
          </motion.div>

          {/* Main content */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-coffee-800">Connected Devices</h2>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus size={16} />}
                className="bg-coffee-600 hover:bg-coffee-700"
              >
                Add Device
              </Button>
            </div>

            <div className="space-y-4">
              {devices.map(device => (
                <motion.div 
                  key={device.id}
                  className="bg-beige-50 border border-beige-200 rounded-lg shadow-warm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  layout
                >
                  <div className="p-5">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg ${device.status === 'online' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                        {device.icon}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-coffee-800">{device.name}</h3>
                            <div className="flex items-center mt-1">
                              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${device.status === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                              <span className="text-sm text-coffee-600 capitalize">{device.status}</span>
                              <span className="mx-2 text-coffee-300">•</span>
                              <span className="text-sm text-coffee-500">Last seen: {device.lastSeen}</span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {device.status === 'online' ? (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="text-emerald-600 hover:text-emerald-800 p-1 rounded-full hover:bg-beige-200 mr-2"
                                title="Device is online"
                              >
                                <Wifi size={18} />
                              </motion.button>
                            ) : (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="text-rose-600 hover:text-rose-800 p-1 rounded-full hover:bg-beige-200 mr-2"
                                title="Device is offline"
                              >
                                <AlertCircle size={18} />
                              </motion.button>
                            )}
                            {showDeleteConfirm !== device.id ? (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="text-coffee-500 hover:text-rose-600 p-1 rounded-full hover:bg-beige-200"
                                onClick={() => setShowDeleteConfirm(device.id)}
                                title="Remove device"
                              >
                                <Trash2 size={18} />
                              </motion.button>
                            ) : (
                              <div className="flex items-center space-x-1">
                                <button
                                  className="text-rose-600 hover:text-rose-800 bg-rose-100 hover:bg-rose-200 py-1 px-2 rounded text-xs font-medium"
                                  onClick={() => handleDeleteDevice(device.id)}
                                >
                                  Confirm
                                </button>
                                <button
                                  className="text-coffee-600 hover:text-coffee-800 bg-beige-200 hover:bg-beige-300 py-1 px-2 rounded text-xs font-medium"
                                  onClick={() => setShowDeleteConfirm(null)}
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-beige-100 p-3 rounded-lg">
                        <div className="text-xs text-coffee-500 mb-1">Type</div>
                        <div className="font-medium text-coffee-800 capitalize">{device.type}</div>
                      </div>
                      
                      {device.firmware && (
                        <div className="bg-beige-100 p-3 rounded-lg">
                          <div className="text-xs text-coffee-500 mb-1">Firmware</div>
                          <div className="font-medium text-coffee-800">{device.firmware}</div>
                        </div>
                      )}
                      
                      {device.battery !== null && (
                        <div className="bg-beige-100 p-3 rounded-lg">
                          <div className="text-xs text-coffee-500 mb-1">Battery</div>
                          <div className={`font-medium ${getBatteryColor(device.battery)}`}>
                            {device.battery}%
                          </div>
                        </div>
                      )}
                      
                      {device.channels.length > 0 && (
                        <div className={`bg-beige-100 p-3 rounded-lg ${device.firmware ? 'col-span-2' : 'col-span-1'}`}>
                          <div className="text-xs text-coffee-500 mb-1">Connected Channels</div>
                          <div className="font-medium text-coffee-800">
                            {device.channels.join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-beige-200 flex justify-between items-center">
                      <div className="text-sm text-coffee-600">
                        {device.type === 'sensor' ? 'Sensor data sending interval: 15 minutes' : 'Authentication: Secure'}
                      </div>
                      
                      <div className="flex items-center">
                        <button
                          type="button"
                          className={`relative inline-flex items-center h-5 rounded-full w-9 transition-colors focus:outline-none bg-coffee-600`}
                        >
                          <span
                            className={`inline-block w-3 h-3 transform bg-white rounded-full transition-transform translate-x-5`}
                          />
                        </button>
                        <span className="ml-2 text-sm text-coffee-700">Enabled</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              className="mt-6 rounded-lg border border-beige-300 border-dashed p-8 text-center bg-beige-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              whileHover={{ backgroundColor: 'rgba(225, 215, 204, 0.5)' }}
            >
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-beige-100 text-coffee-600">
                <Plus size={24} />
              </div>
              <h3 className="mt-3 text-coffee-800 font-medium">Connect a new device</h3>
              <p className="mt-1 text-coffee-600 text-sm">
                Add a new sensor, integrate with mobile apps, or connect other IoT devices
              </p>
              <div className="mt-4">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Plus size={16} />}
                  className="bg-coffee-600 hover:bg-coffee-700"
                >
                  Add Device
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DevicesPage;