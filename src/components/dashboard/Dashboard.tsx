import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../layout/Header';
import NewChannelModal from './NewChannelModal';
import Button from '../ui/Button';
import { useAppContext } from '../../context/AppContext';
import { AlertCircle, Plus, Layers, BarChart2, Zap, Activity, Sparkles, Settings, ExternalLink } from 'lucide-react';
import Card from '../ui/Card';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { isLoading, error, channels } = useAppContext();
  const [isNewChannelModalOpen, setIsNewChannelModalOpen] = useState(false);
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        ease: [0.22, 1, 0.36, 1],
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  // Animation elements for background
  const floatingElements = [
    { icon: <BarChart2 size={24} />, delay: 0, duration: 7, x: 10, y: 15 },
    { icon: <Sparkles size={20} />, delay: 2, duration: 8, x: -15, y: 20 },
    { icon: <Activity size={24} />, delay: 1.5, duration: 6, x: 20, y: 10 },
    { icon: <Zap size={18} />, delay: 0.8, duration: 9, x: -10, y: 25 }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-beige-100 text-coffee-800">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {error && (
          <motion.div 
            className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-rose-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="flex-1">{error}</span>
            </div>
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Welcome Section */}
          <motion.div 
            variants={itemVariants}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-coffee-800 to-coffee-900 text-beige-50 p-8 md:p-12"
          >
            {/* Animated background elements */}
            {floatingElements.map((element, index) => (
              <motion.div
                key={index}
                className="absolute text-beige-50/10"
                style={{ 
                  top: `${20 + (index * 15)}%`, 
                  left: `${15 + (index * 20)}%`, 
                }}
                animate={{ 
                  y: [element.y, -element.y, element.y],
                  x: [element.x, -element.x, element.x],
                  rotate: [0, 360],
                }}
                transition={{ 
                  duration: element.duration,
                  delay: element.delay,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              >
                {element.icon}
              </motion.div>
            ))}
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome to ThinkV</h1>
                  <p className="text-beige-200 max-w-xl">
                    Your IoT data visualization platform. Create channels, connect devices, and visualize your data in real-time.
                  </p>
                </div>
                <Button
                  onClick={() => setIsNewChannelModalOpen(true)}
                  className="bg-beige-50 hover:bg-beige-100 text-coffee-800"
                  leftIcon={<Plus size={18} />}
                >
                  Create Channel
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Channels Grid */}
          <motion.div variants={itemVariants}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-coffee-800">Your Channels</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNewChannelModalOpen(true)}
                leftIcon={<Plus size={16} />}
              >
                New Channel
              </Button>
            </div>

            {channels.length === 0 ? (
              <Card className="p-12 flex flex-col items-center justify-center text-center">
                <motion.div
                  className="w-20 h-20 bg-coffee-100 rounded-full flex items-center justify-center mb-6"
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, 0, -5, 0] 
                  }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity,
                    repeatType: "reverse" 
                  }}
                >
                  <Layers size={40} className="text-coffee-600" />
                </motion.div>
                <h3 className="text-xl font-semibold text-coffee-800 mb-2">No Channels Yet</h3>
                <p className="text-coffee-600 mb-6 max-w-md">
                  Get started by creating your first channel to begin collecting and visualizing IoT data.
                </p>
                <Button
                  onClick={() => setIsNewChannelModalOpen(true)}
                  className="bg-coffee-600 hover:bg-coffee-700"
                  leftIcon={<Plus size={18} />}
                >
                  Create Your First Channel
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channels.map((channel) => (
                  <motion.div
                    key={channel.id}
                    className="relative"
                    onHoverStart={() => setHoveredChannel(channel.id)}
                    onHoverEnd={() => setHoveredChannel(null)}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="h-full p-6 bg-gradient-to-br from-beige-50 to-beige-100 overflow-hidden group">
                      <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link 
                          to={`/channels/${channel.id}/details`}
                          className="p-1.5 rounded-md hover:bg-beige-200 text-coffee-500 hover:text-coffee-700"
                        >
                          <Settings size={16} />
                        </Link>
                        <Link 
                          to={`/channels/${channel.id}`}
                          className="p-1.5 rounded-md hover:bg-beige-200 text-coffee-500 hover:text-coffee-700"
                        >
                          <ExternalLink size={16} />
                        </Link>
                        <Link 
                          to={`/simulator/${channel.id}`}
                          className="p-1.5 rounded-md hover:bg-beige-200 text-coffee-500 hover:text-coffee-700"
                        >
                          <Zap size={16} />
                        </Link>
                      </div>

                      <div className="mb-4">
                        <motion.div 
                          className="w-12 h-12 bg-coffee-100 rounded-lg flex items-center justify-center mb-3"
                          animate={hoveredChannel === channel.id ? { 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, 0, -5, 0]
                          } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Layers size={24} className="text-coffee-600" />
                        </motion.div>
                        <h3 className="text-lg font-semibold text-coffee-800 mb-1">{channel.name}</h3>
                        <p className="text-coffee-600 text-sm line-clamp-2">{channel.description}</p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1">
                          {channel.fields.map(field => (
                            <span
                              key={field.id}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                              style={{
                                backgroundColor: `${field.color}15`,
                                color: field.color,
                              }}
                            >
                              {field.name}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs text-coffee-500">
                          <span>Created {new Date(channel.createdAt).toLocaleDateString()}</span>
                          <span className={`px-2 py-0.5 rounded-full ${
                            channel.isPublic 
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-beige-200 text-coffee-700'
                          }`}>
                            {channel.isPublic ? 'Public' : 'Private'}
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/channels/${channel.id}`}
                        className="absolute inset-0 z-10"
                        aria-label={`View ${channel.name} dashboard`}
                      />
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>

      {/* New Channel Modal */}
      <NewChannelModal 
        isOpen={isNewChannelModalOpen} 
        onClose={() => setIsNewChannelModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;