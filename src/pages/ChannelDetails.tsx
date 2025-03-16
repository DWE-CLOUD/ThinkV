import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, ArrowLeft, Trash2, Edit, Share2, Download, AlertCircle } from 'lucide-react';
import Header from '../components/layout/Header';
import { useAppContext } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ApiKeySection from '../components/channels/ApiKeySection';
import ChannelChart from '../components/dashboard/ChannelChart';
import ChannelStats from '../components/dashboard/ChannelStats';
import TimeRangeSelector from '../components/dashboard/TimeRangeSelector';

const ChannelDetails: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { channels, selectedChannel, setSelectedChannel, deleteChannel, refreshData } = useAppContext();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (channelId && channels.length > 0) {
      const channel = channels.find(ch => ch.id === channelId);
      if (channel) {
        setSelectedChannel(channel);
      } else {
        // Channel not found, redirect to dashboard
        navigate('/dashboard');
      }
    }
  }, [channelId, channels, setSelectedChannel, navigate]);

  const handleDelete = () => {
    if (channelId) {
      deleteChannel(channelId);
      navigate('/dashboard');
    }
  };

  const handleApiKeyUpdated = (newApiKey: string) => {
    if (channelId && selectedChannel) {
      setSelectedChannel({
        ...selectedChannel,
        apiKey: newApiKey
      });
    }
  };

  if (!selectedChannel) {
    return (
      <div className="min-h-screen bg-beige-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-lg font-medium text-coffee-800 mb-2">Loading channel details...</div>
              <div className="text-coffee-600">Please wait while we load the channel information.</div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <button 
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center text-coffee-600 hover:text-coffee-800 mb-2"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-coffee-800">{selectedChannel.name}</h1>
              <p className="text-coffee-600 max-w-2xl">{selectedChannel.description}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Edit size={16} />}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Share2 size={16} />}
              >
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Download size={16} />}
              >
                Export
              </Button>
              <Button
                variant={confirmDelete ? "danger" : "outline"}
                size="sm"
                leftIcon={<Trash2 size={16} />}
                onClick={() => confirmDelete ? handleDelete() : setConfirmDelete(true)}
              >
                {confirmDelete ? "Confirm Delete" : "Delete"}
              </Button>
              {confirmDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - channel details and API key */}
          <div className="space-y-6">
            <ApiKeySection 
              channelId={selectedChannel.id} 
              apiKey={selectedChannel.apiKey || 'thinkv_no_key_available'} 
              onApiKeyUpdated={handleApiKeyUpdated}
            />
            
            <Card>
              <h3 className="text-lg font-medium text-coffee-800 mb-4">Channel Details</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-coffee-700">Channel ID</h4>
                  <p className="font-mono text-sm bg-beige-100 p-2 rounded-md mt-1">{selectedChannel.id}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-coffee-700">Created At</h4>
                  <p className="text-coffee-600 mt-1">
                    {new Date(selectedChannel.createdAt).toLocaleDateString()} {new Date(selectedChannel.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-coffee-700">Last Updated</h4>
                  <p className="text-coffee-600 mt-1">
                    {new Date(selectedChannel.updatedAt).toLocaleDateString()} {new Date(selectedChannel.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-coffee-700">Fields</h4>
                  <div className="mt-1 space-y-2">
                    {selectedChannel.fields.map(field => (
                      <div 
                        key={field.id} 
                        className="flex items-center p-2 rounded-md"
                        style={{ backgroundColor: `${field.color}15` }}
                      >
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: field.color }}
                        ></div>
                        <div className="flex-1">
                          <div className="text-sm font-medium" style={{ color: field.color }}>
                            {field.name}
                          </div>
                          {field.unit && (
                            <div className="text-xs text-coffee-600">
                              Unit: {field.unit}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-coffee-500">
                          Field {field.fieldNumber}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Right column - visualization and stats */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-coffee-800">Data Visualization</h3>
                <div className="flex items-center gap-2">
                  <TimeRangeSelector />
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Settings size={16} />}
                    onClick={refreshData}
                  >
                    Refresh
                  </Button>
                </div>
              </div>
              
              <div className="h-96">
                <ChannelChart />
              </div>
            </Card>
            
            <Card>
              <h3 className="text-lg font-medium text-coffee-800 mb-4">Channel Statistics</h3>
              <div className="h-72">
                <ChannelStats />
              </div>
            </Card>
            
            <Card>
              <h3 className="text-lg font-medium text-coffee-800 mb-4">API Usage Examples</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-coffee-700 mb-2">Send Data with HTTP POST</h4>
                  <div className="bg-coffee-800 text-beige-100 p-4 rounded-md overflow-x-auto">
                    <pre className="text-sm">
{`# Using curl to send data
curl -X POST "https://api.dwoscloud.shop/api/v1/channels/${selectedChannel.id}" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${selectedChannel.apiKey || 'YOUR_API_KEY'}" \\
  -d '{
  "field1": 23.5,
  "field2": 45.2,
  "timestamp": "2023-06-15T12:34:56Z"
}'`}
                    </pre>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-coffee-700 mb-2">JavaScript Example</h4>
                  <div className="bg-coffee-800 text-beige-100 p-4 rounded-md overflow-x-auto">
                    <pre className="text-sm">
{`// Using fetch API
const apiKey = "${selectedChannel.apiKey || 'YOUR_API_KEY'}";
const url = "https://api.dwoscloud.shop/api/v1/channels/${selectedChannel.id}/data";

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
                </div>
                
                <div className="bg-beige-100 p-4 rounded-md border border-beige-200">
                  <div className="flex items-start">
                    <AlertCircle className="text-coffee-600 h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-coffee-800">API Documentation</h4>
                      <p className="text-sm text-coffee-600 mt-1">
                        For complete API documentation, including more examples and detailed endpoint information,
                        visit our <a href="#" className="text-coffee-700 hover:text-coffee-900 underline">API Documentation</a>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChannelDetails;