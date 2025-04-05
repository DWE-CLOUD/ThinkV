import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Layers, ExternalLink, Trash2, Settings, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Button from '../ui/Button';

interface ChannelListProps {
  onCreateChannel: () => void;
}

const ChannelList: React.FC<ChannelListProps> = ({ onCreateChannel }) => {
  const { channels, selectedChannel, setSelectedChannel, deleteChannel } = useAppContext();
  const [expandedChannelId, setExpandedChannelId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const list = {
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    hidden: {
      opacity: 0,
      transition: {
        when: "afterChildren"
      }
    }
  };

  const item = {
    visible: { opacity: 1, y: 0 },
    hidden: { opacity: 0, y: 20 }
  };

  const handleToggleExpand = (channelId: string) => {
    if (expandedChannelId === channelId) {
      setExpandedChannelId(null);
    } else {
      setExpandedChannelId(channelId);
      setSelectedChannel(channels.find(ch => ch.id === channelId) || null);
    }
  };

  const handleDelete = async (channelId: string) => {
    try {
      setIsDeleting(true);
      await deleteChannel(channelId);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting channel:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-beige-50 rounded-lg shadow-warm h-full flex flex-col border border-beige-200">
      <div className="p-3 border-b border-beige-200 flex justify-between items-center">
        <h2 className="text-lg font-medium text-coffee-800">Your Channels</h2>
        <Button
          size="sm"
          onClick={onCreateChannel}
          leftIcon={<Plus size={16} />}
          className="bg-coffee-600 hover:bg-coffee-700"
        >
          New
        </Button>
      </div>
      
      {channels.length === 0 ? (
        <motion.div 
          className="flex-1 flex flex-col items-center justify-center p-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div 
            className="bg-beige-200 p-3 rounded-full mb-3"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Layers size={24} className="text-coffee-600" />
          </motion.div>
          <motion.p 
            className="text-coffee-600 mb-4"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            You don't have any channels yet
          </motion.p>
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Button
              variant="primary"
              size="sm"
              onClick={onCreateChannel}
              leftIcon={<Plus size={16} />}
              className="bg-coffee-600 hover:bg-coffee-700"
            >
              Create your first channel
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div 
          className="overflow-y-auto flex-1"
          initial="hidden"
          animate="visible"
          variants={list}
        >
          <ul className="p-2 space-y-1">
            <AnimatePresence>
              {channels.map(channel => (
                <motion.li 
                  key={channel.id} 
                  variants={item}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    className={`w-full rounded-md transition-all border-l-4 ${
                      selectedChannel?.id === channel.id
                        ? 'border-coffee-500 shadow-warm'
                        : 'border-transparent'
                    }`}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`flex justify-between items-center p-3 ${
                      selectedChannel?.id === channel.id ? 'bg-coffee-100' : 'hover:bg-beige-100'
                    }`}>
                      <motion.button
                        onClick={() => handleToggleExpand(channel.id)}
                        className="flex-1 text-left flex items-center"
                      >
                        <motion.div
                          animate={{ rotate: expandedChannelId === channel.id ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                          className="mr-2 text-coffee-500"
                        >
                          <ChevronRight size={16} />
                        </motion.div>
                        <p className="font-medium text-coffee-800 truncate">{channel.name}</p>
                      </motion.button>
                      
                      <div className="flex space-x-1">
                        <Link 
                          to={`/channels/${channel.id}/details`}
                          className="p-1 rounded-md hover:bg-beige-200 text-coffee-500 hover:text-coffee-700 flex-shrink-0"
                          title="Channel Settings"
                        >
                          <Settings size={14} />
                        </Link>
                        <Link 
                          to={`/channels/${channel.id}`}
                          className="p-1 rounded-md hover:bg-beige-200 text-coffee-500 hover:text-coffee-700 flex-shrink-0"
                          title="View channel dashboard"
                        >
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {expandedChannelId === channel.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="pl-5 pr-3 pb-3 pt-1 bg-beige-50"
                        >
                          {channel.description && (
                            <p className="text-xs text-coffee-600 mb-2">{channel.description}</p>
                          )}
                          
                          <div className="flex flex-wrap gap-1 mb-2">
                            {channel.fields.slice(0, 3).map(field => (
                              <motion.span
                                key={field.id}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
                                style={{
                                  backgroundColor: `${field.color}10`,
                                  color: field.color,
                                }}
                                whileHover={{ scale: 1.05 }}
                              >
                                {field.name}
                              </motion.span>
                            ))}
                            {channel.fields.length > 3 && (
                              <motion.span 
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-beige-200 text-coffee-700"
                                whileHover={{ scale: 1.05 }}
                              >
                                +{channel.fields.length - 3}
                              </motion.span>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-beige-200">
                            <div className="text-[10px] text-coffee-500">
                              Created: {new Date(channel.createdAt).toLocaleDateString()}
                            </div>
                            
                            {showDeleteConfirm === channel.id ? (
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="danger"
                                  size="xs"
                                  isLoading={isDeleting}
                                  onClick={() => handleDelete(channel.id)}
                                  className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] py-0.5 px-1.5"
                                >
                                  Confirm
                                </Button>
                                <Button
                                  variant="outline"
                                  size="xs"
                                  onClick={() => setShowDeleteConfirm(null)}
                                  className="text-[10px] py-0.5 px-1.5"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex space-x-1">
                                <button
                                  className="text-coffee-500 hover:text-coffee-700 p-1 rounded hover:bg-beige-200"
                                  title="Delete channel"
                                  onClick={() => setShowDeleteConfirm(channel.id)}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default ChannelList;