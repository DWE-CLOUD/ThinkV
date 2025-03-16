import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Layers, ChevronRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Button from '../ui/Button';

interface ChannelListProps {
  onCreateChannel: () => void;
}

const ChannelList: React.FC<ChannelListProps> = ({ onCreateChannel }) => {
  const { channels, selectedChannel, setSelectedChannel } = useAppContext();

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

  return (
    <div className="bg-beige-50 rounded-lg shadow-warm h-full flex flex-col border border-beige-200">
      <div className="p-4 border-b border-beige-200 flex justify-between items-center">
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
                    className={`w-full text-left p-3 rounded-md transition-all ${
                      selectedChannel?.id === channel.id
                        ? 'bg-coffee-100 text-coffee-800 border-l-4 border-coffee-500 shadow-warm'
                        : 'hover:bg-beige-100 text-coffee-700 border-l-4 border-transparent'
                    }`}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex justify-between items-center">
                      <motion.button
                        onClick={() => setSelectedChannel(channel)}
                        className="flex-1 text-left"
                      >
                        <p className="font-medium truncate">{channel.name}</p>
                        <p className="text-xs text-coffee-500 truncate mt-1">
                          {channel.description.length > 50
                            ? channel.description.substring(0, 50) + '...'
                            : channel.description}
                        </p>
                      </motion.button>
                      <Link 
                        to={`/channels/${channel.id}`}
                        className="p-1 rounded-md hover:bg-beige-200 text-coffee-500 hover:text-coffee-700"
                        title="View channel dashboard"
                      >
                        <ExternalLink size={16} />
                      </Link>
                    </div>
                    <div className="flex mt-2 flex-wrap">
                      {channel.fields.slice(0, 3).map(field => (
                        <motion.span
                          key={field.id}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-1 mb-1"
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
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-beige-200 text-coffee-700"
                          whileHover={{ scale: 1.05 }}
                        >
                          +{channel.fields.length - 3} more
                        </motion.span>
                      )}
                    </div>
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