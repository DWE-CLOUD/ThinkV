import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Settings, Download, Link as LinkIcon, Copy, ExternalLink, Code, Key, RefreshCw, Info, Trash2 } from 'lucide-react';
import Header from '../components/layout/Header';
import { useAppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import ChannelChart from '../components/dashboard/ChannelChart';
import ChannelStats from '../components/dashboard/ChannelStats';
import TimeRangeSelector from '../components/dashboard/TimeRangeSelector';
import Button from '../components/ui/Button';
import ConfirmDeleteModal from '../components/channels/ConfirmDeleteModal';

const ChannelDashboard: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const { channels, setSelectedChannel, selectedChannel, refreshData, deleteChannel } = useAppContext();
  
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [webhookUrlCopied, setWebhookUrlCopied] = useState(false);
  const [showApiCode, setShowApiCode] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  // Find the channel based on the ID parameter
  useEffect(() => {
    if (channelId && channels.length > 0) {
      const channel = channels.find(c => c.id === channelId);
      if (channel) {
        setSelectedChannel(channel);
      }
    }
  }, [channelId, channels, setSelectedChannel]);

  const handleDelete = async () => {
    if (!channelId) return;
    
    setDeleteInProgress(true);
    
    try {
      const success = await deleteChannel(channelId);
      if (success) {
        navigate('/dashboard');
      } else {
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      console.error("Error deleting channel:", error);
    } finally {
      setDeleteInProgress(false);
    }
  };

  if (!selectedChannel) {
    return (
      <div className="min-h-screen bg-beige-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-beige-50 border border-beige-200 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-coffee-800 mb-4">Channel not found</h1>
            <p className="text-coffee-600">The channel you are looking for does not exist or you do not have access to it.</p>
          </div>
        </div>
      </div>
    );
  }

  const copyApiKey = () => {
    if (selectedChannel.apiKey) {
      navigator.clipboard.writeText(selectedChannel.apiKey);
      setApiKeyCopied(true);
      setTimeout(() => setApiKeyCopied(false), 3000);
    }
  };

  const webhookUrl = `https://api.thinkv.space/channels/${selectedChannel.id}`;

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setWebhookUrlCopied(true);
    setTimeout(() => setWebhookUrlCopied(false), 3000);
  };

  return (
    <div className="min-h-screen bg-beige-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl font-bold text-coffee-800">{selectedChannel.name}</h1>
              <p className="text-coffee-600">{selectedChannel.description}</p>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw size={16} />}
                onClick={refreshData}
              >
                Refresh
              </Button>
              <Link to={`/channels/${selectedChannel.id}/details`}>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Settings size={16} />}
                >
                  Settings
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download size={16} />}
              >
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Trash2 size={16} />}
                onClick={() => setIsDeleteModalOpen(true)}
                className="bg-rose-100 hover:bg-rose-200 text-rose-700 hover:text-rose-800 border-rose-300"
              >
                Delete
              </Button>
            </motion.div>
          </div>
          
          <motion.div 
            className="flex flex-wrap gap-2 mt-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {selectedChannel.tags.map(tag => (
              <span 
                key={tag} 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-coffee-100 text-coffee-700"
              >
                {tag}
              </span>
            ))}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-beige-200 text-coffee-700">
              {selectedChannel.isPublic ? 'Public' : 'Private'}
            </span>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - Chart and Stats */}
          <motion.div 
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Chart */}
            <div className="bg-beige-50 border border-beige-200 rounded-lg p-6 shadow-warm">
              <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-medium text-coffee-800">Data Visualization</h2>
                <TimeRangeSelector />
              </div>
              
              <div className="h-[400px]">
                <ChannelChart />
              </div>
            </div>
            
            {/* Stats */}
            <div className="bg-beige-50 border border-beige-200 rounded-lg p-6 shadow-warm">
              <h2 className="text-lg font-medium text-coffee-800 mb-4">Channel Statistics</h2>
              <div className="h-[300px]">
                <ChannelStats />
              </div>
            </div>
          </motion.div>
          
          {/* Sidebar - Integration details */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* Channel details card */}
            <Card>
              <h2 className="text-lg font-medium text-coffee-800 mb-4">Channel Details</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-coffee-700 mb-1">Channel ID</h3>
                  <div className="flex items-center">
                    <code className="bg-beige-100 px-2 py-1 rounded text-coffee-700 font-mono text-sm flex-1 overflow-x-auto">
                      {selectedChannel.id}
                    </code>
                    <button 
                      className="ml-2 text-coffee-500 hover:text-coffee-700 p-1 rounded-md hover:bg-beige-100"
                      onClick={() => navigator.clipboard.writeText(selectedChannel.id)}
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-coffee-700 mb-1">Created</h3>
                  <p className="text-coffee-600">
                    {new Date(selectedChannel.createdAt).toLocaleDateString()} at {new Date(selectedChannel.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-coffee-700 mb-1">Last Updated</h3>
                  <p className="text-coffee-600">
                    {new Date(selectedChannel.updatedAt).toLocaleDateString()} at {new Date(selectedChannel.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-coffee-700 mb-1">Fields</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedChannel.fields.map(field => (
                      <div 
                        key={field.id}
                        className="flex items-center px-2 py-1 rounded-md text-xs"
                        style={{ 
                          backgroundColor: `${field.color}20`,
                          color: field.color
                        }}
                      >
                        <span 
                          className="w-2 h-2 rounded-full mr-1"
                          style={{ backgroundColor: field.color }}
                        ></span>
                        {field.name}
                        {field.unit && <span className="ml-1 text-coffee-600">({field.unit})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
            
            {/* API Access card */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-coffee-800">API Access</h2>
                <button 
                  className="text-coffee-600 hover:text-coffee-800 flex items-center text-sm"
                  onClick={() => setShowApiCode(!showApiCode)}
                >
                  <Code size={16} className="mr-1" />
                  {showApiCode ? 'Hide Code' : 'Show Code'}
                </button>
              </div>
              
              <div className="space-y-4">
                {/* API Key */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium text-coffee-700">Write API Key</h3>
                    <div className="text-xs text-coffee-500 flex items-center">
                      <Key size={12} className="mr-1" />
                      Keep this secret!
                    </div>
                  </div>
                  
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="password"
                      value={selectedChannel.apiKey || '••••••••••••••••••••••'}
                      readOnly
                      className="w-full px-3 py-2 pr-10 bg-beige-100 border border-beige-300 rounded-md text-coffee-800 font-mono text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button 
                        className="text-coffee-500 hover:text-coffee-700 focus:outline-none"
                        onClick={copyApiKey}
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  {apiKeyCopied && (
                    <motion.p 
                      className="text-xs text-emerald-600 mt-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      API key copied to clipboard!
                    </motion.p>
                  )}
                </div>
                
                {/* Webhook URL */}
                <div>
                  <h3 className="text-sm font-medium text-coffee-700 mb-1">Webhook URL</h3>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="text"
                      value={webhookUrl}
                      readOnly
                      className="w-full px-3 py-2 pr-10 bg-beige-100 border border-beige-300 rounded-md text-coffee-800 font-mono text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button 
                        className="text-coffee-500 hover:text-coffee-700 focus:outline-none"
                        onClick={copyWebhookUrl}
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  {webhookUrlCopied && (
                    <motion.p 
                      className="text-xs text-emerald-600 mt-1"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      Webhook URL copied to clipboard!
                    </motion.p>
                  )}
                </div>
                
                {/* Sample code */}
                {showApiCode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <h3 className="text-sm font-medium text-coffee-700 mb-1">Sample Code</h3>
                    <div className="bg-coffee-800 text-beige-100 rounded-md p-3 overflow-x-auto">
                      <pre className="text-xs">
{`// Using fetch to send data to the channel
const apiKey = "${selectedChannel.apiKey || 'YOUR_API_KEY'}";
const url = "${webhookUrl}";

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey
  },
  body: JSON.stringify({
    field1: 23.5,
    field2: 45.2,
    timestamp: new Date().toISOString()
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));`}
                      </pre>
                    </div>
                    <div className="flex justify-end mt-2">
                      <button 
                        className="text-coffee-600 hover:text-coffee-800 text-xs flex items-center"
                        onClick={() => navigator.clipboard.writeText(
                          `// Using fetch to send data to the channel
const apiKey = "${selectedChannel.apiKey || 'YOUR_API_KEY'}";
const url = "${webhookUrl}";

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey
  },
  body: JSON.stringify({
    field1: 23.5,
    field2: 45.2,
    timestamp: new Date().toISOString()
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));`
                        )}
                      >
                        <Copy size={12} className="mr-1" />
                        Copy code
                      </button>
                    </div>
                  </motion.div>
                )}
                
                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Info size={16} />}
                  >
                    API Docs
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<LinkIcon size={16} />}
                  >
                    Integration Guide
                  </Button>
                </div>
              </div>
            </Card>
            
            {/* Quick Links */}
            <Card>
              <h2 className="text-lg font-medium text-coffee-800 mb-4">Quick Links</h2>
              
              <ul className="space-y-2">
                <li>
                  <a 
                    href={`/public/channels/${selectedChannel.id}`}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="flex items-center px-3 py-2 rounded-md text-coffee-700 hover:bg-beige-100 transition-colors"
                  >
                    <ExternalLink size={16} className="mr-2 text-coffee-500" />
                    <span>Public View</span>
                  </a>
                </li>
                <li>
                   <a 
                     href="#" 
                     className="flex items-center px-3 py-2 rounded-md text-coffee-700 hover:bg-beige-100 transition-colors"
                   >
                     <Download size={16} className="mr-2 text-coffee-500" />
                     <span>Export Data (CSV)</span>
                   </a>
                 </li>
                <li>
                  <Link 
                    to={`/channels/${selectedChannel.id}/details`}
                    className="flex items-center px-3 py-2 rounded-md text-coffee-700 hover:bg-beige-100 transition-colors"
                  >
                    <Settings size={16} className="mr-2 text-coffee-500" />
                    <span>Channel Settings</span>
                  </Link>
                </li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Delete Channel Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        channelName={selectedChannel.name}
        isDeleting={deleteInProgress}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default ChannelDashboard;