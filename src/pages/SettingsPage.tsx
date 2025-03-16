import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Bell, Moon, Globe, Shield, Wifi, Smartphone, ToggleLeft, Save, Loader } from 'lucide-react';
import Header from '../components/layout/Header';
import { useAppContext } from '../context/AppContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const SettingsPage: React.FC = () => {
  const { currentUser } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      updates: false,
      marketing: false
    },
    appearance: {
      darkMode: false,
      compactView: true
    },
    privacy: {
      publicProfile: true,
      showActivity: true,
      showChannels: false
    }
  });

  const handleToggle = (category: string, setting: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [setting]: !prev[category as keyof typeof prev][setting as keyof typeof prev[keyof typeof prev]]
      }
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSuccessMessage('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setSuccessMessage('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
      // Show success message for 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-beige-100">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-medium text-coffee-800 mb-4">Please log in to view your settings</h2>
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
          <h1 className="text-2xl font-bold text-coffee-800">Account Settings</h1>
          <p className="text-coffee-600">Manage your preferences and account settings</p>
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
                    className="flex items-center px-6 py-4 bg-beige-100 border-l-4 border-coffee-600 text-coffee-800 font-medium"
                  >
                    <Settings className="mr-3 h-5 w-5 text-coffee-600" />
                    Account Settings
                  </a>
                </li>
                <li>
                  <a 
                    href="/devices" 
                    className="flex items-center px-6 py-4 hover:bg-beige-100 text-coffee-700 hover:text-coffee-800"
                  >
                    <Smartphone className="mr-3 h-5 w-5 text-coffee-500" />
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
            {successMessage && (
              <motion.div 
                className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {successMessage}
              </motion.div>
            )}

            {/* Notification Settings */}
            <Card className="mb-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-coffee-800 flex items-center">
                  <Bell size={20} className="mr-2 text-coffee-600" />
                  Notification Settings
                </h2>
                <p className="text-coffee-600 text-sm">Control how and when you receive notifications</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2 py-3 hover:bg-beige-100 rounded-lg">
                  <div>
                    <h3 className="font-medium text-coffee-800">Email Notifications</h3>
                    <p className="text-sm text-coffee-600">Receive updates and alerts via email</p>
                  </div>
                  <div>
                    <button
                      type="button"
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                        settings.notifications.email ? 'bg-coffee-600' : 'bg-beige-300'
                      }`}
                      onClick={() => handleToggle('notifications', 'email')}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                          settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2 py-3 hover:bg-beige-100 rounded-lg">
                  <div>
                    <h3 className="font-medium text-coffee-800">Push Notifications</h3>
                    <p className="text-sm text-coffee-600">Receive push notifications on your devices</p>
                  </div>
                  <div>
                    <button
                      type="button"
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                        settings.notifications.push ? 'bg-coffee-600' : 'bg-beige-300'
                      }`}
                      onClick={() => handleToggle('notifications', 'push')}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                          settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2 py-3 hover:bg-beige-100 rounded-lg">
                  <div>
                    <h3 className="font-medium text-coffee-800">Product Updates</h3>
                    <p className="text-sm text-coffee-600">Get notified about new features and updates</p>
                  </div>
                  <div>
                    <button
                      type="button"
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                        settings.notifications.updates ? 'bg-coffee-600' : 'bg-beige-300'
                      }`}
                      onClick={() => handleToggle('notifications', 'updates')}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                          settings.notifications.updates ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2 py-3 hover:bg-beige-100 rounded-lg">
                  <div>
                    <h3 className="font-medium text-coffee-800">Marketing Emails</h3>
                    <p className="text-sm text-coffee-600">Receive promotional emails about our services</p>
                  </div>
                  <div>
                    <button
                      type="button"
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                        settings.notifications.marketing ? 'bg-coffee-600' : 'bg-beige-300'
                      }`}
                      onClick={() => handleToggle('notifications', 'marketing')}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                          settings.notifications.marketing ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Appearance Settings */}
            <Card className="mb-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-coffee-800 flex items-center">
                  <Moon size={20} className="mr-2 text-coffee-600" />
                  Appearance Settings
                </h2>
                <p className="text-coffee-600 text-sm">Customize how ThinkV looks for you</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2 py-3 hover:bg-beige-100 rounded-lg">
                  <div>
                    <h3 className="font-medium text-coffee-800">Dark Mode</h3>
                    <p className="text-sm text-coffee-600">Switch to dark theme for low-light environments</p>
                  </div>
                  <div>
                    <button
                      type="button"
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                        settings.appearance.darkMode ? 'bg-coffee-600' : 'bg-beige-300'
                      }`}
                      onClick={() => handleToggle('appearance', 'darkMode')}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                          settings.appearance.darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2 py-3 hover:bg-beige-100 rounded-lg">
                  <div>
                    <h3 className="font-medium text-coffee-800">Compact View</h3>
                    <p className="text-sm text-coffee-600">Display more content with a condensed layout</p>
                  </div>
                  <div>
                    <button
                      type="button"
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                        settings.appearance.compactView ? 'bg-coffee-600' : 'bg-beige-300'
                      }`}
                      onClick={() => handleToggle('appearance', 'compactView')}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                          settings.appearance.compactView ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Privacy Settings */}
            <Card className="mb-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-coffee-800 flex items-center">
                  <Shield size={20} className="mr-2 text-coffee-600" />
                  Privacy Settings
                </h2>
                <p className="text-coffee-600 text-sm">Control who can see your information and data</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2 py-3 hover:bg-beige-100 rounded-lg">
                  <div>
                    <h3 className="font-medium text-coffee-800">Public Profile</h3>
                    <p className="text-sm text-coffee-600">Make your profile visible to other users</p>
                  </div>
                  <div>
                    <button
                      type="button"
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                        settings.privacy.publicProfile ? 'bg-coffee-600' : 'bg-beige-300'
                      }`}
                      onClick={() => handleToggle('privacy', 'publicProfile')}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                          settings.privacy.publicProfile ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2 py-3 hover:bg-beige-100 rounded-lg">
                  <div>
                    <h3 className="font-medium text-coffee-800">Show Activity</h3>
                    <p className="text-sm text-coffee-600">Display your recent activity to other users</p>
                  </div>
                  <div>
                    <button
                      type="button"
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                        settings.privacy.showActivity ? 'bg-coffee-600' : 'bg-beige-300'
                      }`}
                      onClick={() => handleToggle('privacy', 'showActivity')}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                          settings.privacy.showActivity ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-2 py-3 hover:bg-beige-100 rounded-lg">
                  <div>
                    <h3 className="font-medium text-coffee-800">Show Channels</h3>
                    <p className="text-sm text-coffee-600">Make your channels visible on your public profile</p>
                  </div>
                  <div>
                    <button
                      type="button"
                      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${
                        settings.privacy.showChannels ? 'bg-coffee-600' : 'bg-beige-300'
                      }`}
                      onClick={() => handleToggle('privacy', 'showChannels')}
                    >
                      <span
                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                          settings.privacy.showChannels ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                leftIcon={isLoading ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
              >
                {isLoading ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;