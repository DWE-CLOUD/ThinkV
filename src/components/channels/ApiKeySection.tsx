import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Eye, EyeOff, Copy, RefreshCw, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { useAppContext } from '../../context/AppContext';

interface ApiKeySectionProps {
  channelId: string;
  apiKey: string;
  onApiKeyUpdated?: (newApiKey: string) => void;
}

const ApiKeySection: React.FC<ApiKeySectionProps> = ({ 
  channelId, 
  apiKey, 
  onApiKeyUpdated 
}) => {
  const { regenerateChannelApiKey } = useAppContext();
  const [isVisible, setIsVisible] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRegenerateApiKey = async () => {
    try {
      setIsRegenerating(true);
      setRegenerateError(null);
      
      // Call the regenerateChannelApiKey function from context
      const newKey = await regenerateChannelApiKey(channelId);
      
      // Call the callback if provided
      if (onApiKeyUpdated) {
        onApiKeyUpdated(newKey);
      }
      
      setShowConfirmation(false);
      setIsVisible(true);
    } catch (error) {
      console.error('Error regenerating API key:', error);
      setRegenerateError(error instanceof Error ? error.message : 'Failed to regenerate API key');
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Card className="bg-beige-50 border-beige-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-coffee-800 flex items-center">
          <Key className="mr-2 h-5 w-5 text-coffee-600" />
          API Key
        </h3>
        {!showConfirmation && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfirmation(true)}
            leftIcon={<RefreshCw size={16} />}
          >
            Regenerate
          </Button>
        )}
      </div>
      
      <AnimatePresence mode="wait">
        {showConfirmation ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-rose-50 border border-rose-200 rounded-md mb-4"
          >
            <div className="flex items-start">
              <AlertCircle className="text-rose-500 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-rose-800">Regenerate API Key?</h4>
                <p className="text-sm text-rose-600 mt-1">
                  This will invalidate the current API key. Any devices or applications using this 
                  key will stop working until updated with the new key.
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowConfirmation(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-rose-600 hover:bg-rose-700"
                    size="sm"
                    onClick={handleRegenerateApiKey}
                    disabled={isRegenerating}
                    leftIcon={isRegenerating ? <RefreshCw className="animate-spin" size={16} /> : undefined}
                  >
                    {isRegenerating ? 'Regenerating...' : 'Yes, Regenerate'}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {regenerateError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-rose-50 border border-rose-200 rounded-md mb-3"
              >
                <div className="flex items-start">
                  <AlertCircle className="text-rose-500 h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-rose-700">{regenerateError}</p>
                </div>
              </motion.div>
            )}
            
            <div>
              <p className="text-sm text-coffee-600 mb-2">
                Use this API key to authenticate devices and applications sending data to this channel.
              </p>
              
              <div className="relative mt-1">
                <div className="relative rounded-md shadow-sm">
                  <input
                    type={isVisible ? 'text' : 'password'} 
                    value={apiKey}
                    readOnly
                    className="font-mono text-sm w-full pr-24 pl-3 py-2 rounded-md bg-beige-100 border border-beige-300 focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 overflow-x-auto"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 space-x-1">
                    <button 
                      onClick={toggleVisibility} 
                      className="p-1 rounded-md hover:bg-beige-200 text-coffee-500 hover:text-coffee-700 transition-colors"
                      title={isVisible ? 'Hide API key' : 'Show API key'}
                      aria-label={isVisible ? 'Hide API key' : 'Show API key'}
                    >
                      {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button 
                      onClick={copyToClipboard} 
                      className="p-1 rounded-md hover:bg-beige-200 text-coffee-500 hover:text-coffee-700 transition-colors"
                      title="Copy API key"
                      aria-label="Copy API key to clipboard"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  {isCopied && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-xs text-emerald-600 absolute mt-1"
                    >
                      API key copied to clipboard!
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="text-xs text-coffee-500 bg-beige-100 p-3 rounded-md border border-beige-200">
              <div className="font-medium text-coffee-700 mb-1 flex items-center">
                <AlertCircle size={12} className="mr-1" />
                Important
              </div>
              <ul className="list-disc list-inside space-y-1">
                <li>Keep this API key secure and private.</li>
                <li>Use this key in your IoT devices to authenticate with the ThinkV API.</li>
                <li>If this key is compromised, regenerate it immediately.</li>
              </ul>
            </div>
          </div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default ApiKeySection;