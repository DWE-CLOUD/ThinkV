import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/layout/Header';
import ChannelList from '../components/dashboard/ChannelList';
import ChannelChart from '../components/dashboard/ChannelChart';
import ChannelStats from '../components/dashboard/ChannelStats';
import NewChannelModal from '../components/dashboard/NewChannelModal';
import { useAppContext } from '../context/AppContext';
import { AlertCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { isLoading, error } = useAppContext();
  const [isNewChannelModalOpen, setIsNewChannelModalOpen] = useState(false);

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
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

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
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-rose-500 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}
        
        <motion.div 
          className="grid grid-cols-12 gap-6"
          style={{ minHeight: "calc(100vh - 7rem)" }}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Sidebar with Channel List */}
          <motion.div 
            className="col-span-12 md:col-span-3 lg:col-span-3"
            variants={itemVariants}
          >
            <ChannelList onCreateChannel={() => setIsNewChannelModalOpen(true)} />
          </motion.div>

          {/* Main Content Area */}
          <motion.div className="col-span-12 md:col-span-9 lg:col-span-9 flex flex-col gap-6"
            variants={itemVariants}
            style={{ minHeight: "calc(100vh - 7rem)" }}
          >
            {/* Chart Area */}
            <motion.div 
              className="flex-grow"
              style={{ minHeight: "60%" }}
              variants={itemVariants}
            >
              <ChannelChart />
            </motion.div>
            
            {/* Stats Area */}
            <motion.div 
              className="flex-grow-0"
              style={{ height: "310px" }}
              variants={itemVariants}
            >
              <ChannelStats />
            </motion.div>
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