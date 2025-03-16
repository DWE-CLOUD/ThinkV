import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Copy, Code, Terminal, FileJson, Send, ArrowRight, Smartphone, RefreshCw } from 'lucide-react';
import Header from '../components/layout/Header';
import { useAppContext } from '../context/AppContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useParams, useNavigate } from 'react-router-dom';

// FastAPI backend URL
const FASTAPI_BASE_URL = 'http://82.25.104.223';

const ApiDocumentation: React.FC = () => {
  const { currentUser, channels } = useAppContext();
  const { channelId } = useParams<{ channelId?: string }>();
  const navigate = useNavigate();
  
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<'http' | 'node' | 'python' | 'curl'>('http');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState<string>(FASTAPI_BASE_URL);

  useEffect(() => {
    if (channelId && channels.length > 0) {
      const channel = channels.find(c => c.id === channelId);
      if (channel) {
        setSelectedChannel(channel);
      } else {
        // If channel not found, redirect to all channels
        navigate('/api-docs');
      }
    }
  }, [channelId, channels, navigate]);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-beige-100">
        <Header />
        <div className="container mx-auto px-4 py-8 flex justify-center items-center">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-medium text-coffee-800 mb-4">Please log in to view API documentation</h2>
          </Card>
        </div>
      </div>
    );
  }

  const formatApiUrl = (endpoint: string) => {
    return `${apiUrl}${endpoint}`;
  };

  // Generate code examples based on selected channel and tab
  const getCodeExample = () => {
    if (!selectedChannel) {
      return {
        http: '',
        node: '',
        python: '',
        curl: ''
      };
    }

    const updateUrl = formatApiUrl(`/api/v1/channels/${selectedChannel.id}/update`);
    const apiKey = selectedChannel.apiKey;

    // Example data for the first two fields
    const fieldNames = selectedChannel.fields.slice(0, 2).map(f => f.name);
    
    const http = `// HTTP Request - GET
${updateUrl}?api_key=${apiKey}&field1=23.5${fieldNames[1] ? '&field2=45.2' : ''}

// HTTP Request - POST (JSON)
POST ${updateUrl}
Headers:
  Content-Type: application/json
  X-API-Key: ${apiKey}
  
Body:
{
  "field1": 23.5${fieldNames[1] ? ',\n  "field2": 45.2' : ''}
}`;

    const node = `// Node.js using fetch
const fetch = require('node-fetch');

async function sendData() {
  const apiKey = "${apiKey}";
  const url = "${updateUrl}";
  
  const data = {
    field1: 23.5${fieldNames[1] ? ',\n    field2: 45.2' : ''}
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

sendData();`;

    const python = `# Python using requests
import requests
import json

api_key = "${apiKey}"
url = "${updateUrl}"

data = {
    "field1": 23.5${fieldNames[1] ? ',\n    "field2": 45.2' : ''}
}

headers = {
    "Content-Type": "application/json",
    "X-API-Key": api_key
}

response = requests.post(url, json=data, headers=headers)
print(f"Status code: {response.status_code}")
print(f"Response: {response.json()}")`;

    const curl = `# Using curl with GET request
curl -X GET "${updateUrl}?api_key=${apiKey}&field1=23.5${fieldNames[1] ? '&field2=45.2' : ''}"

# Using curl with POST request
curl -X POST "${updateUrl}" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}" \\
  -d '{
    "field1": 23.5${fieldNames[1] ? ',\n    "field2": 45.2' : ''}
  }'`;

    return {
      http,
      node,
      python,
      curl
    };
  };

  const examples = getCodeExample();

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
          <h1 className="text-2xl font-bold text-coffee-800">API Documentation</h1>
          <p className="text-coffee-600">Learn how to integrate your devices with ThinkV</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar with channel list */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-beige-200">
                <h2 className="text-lg font-medium text-coffee-800">Your Channels</h2>
                <p className="text-sm text-coffee-600">Select a channel to view its API details</p>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <ul className="divide-y divide-beige-200">
                  {channels.map(channel => (
                    <li key={channel.id}>
                      <button 
                        onClick={() => navigate(`/api-docs/${channel.id}`)}
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
                    <p>No channels created yet</p>
                    <Button 
                      className="mt-2" 
                      size="sm"
                      onClick={() => navigate('/dashboard')}
                    >
                      Create Channel
                    </Button>
                  </div>
                )}
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
              <div className="space-y-6">
                <Card>
                  <div className="p-5 border-b border-beige-200">
                    <h2 className="text-xl font-semibold text-coffee-800">
                      {selectedChannel.name} API
                    </h2>
                    <p className="text-coffee-600">{selectedChannel.description}</p>
                  </div>

                  <div className="p-5">
                    <div className="mb-5">
                      <h3 className="text-md font-medium text-coffee-800 mb-2">API Key</h3>
                      <div className="flex items-center bg-beige-100 p-3 rounded-md">
                        <code className="font-mono text-sm text-coffee-700 flex-1 mr-2 overflow-x-auto">
                          {selectedChannel.apiKey}
                        </code>
                        <button
                          onClick={() => copyToClipboard(selectedChannel.apiKey, 'api-key')}
                          className="p-1.5 rounded-md hover:bg-beige-200 text-coffee-500 hover:text-coffee-700 transition-colors"
                        >
                          {copiedCode === 'api-key' ? (
                            <span className="text-xs font-medium text-emerald-600">Copied!</span>
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-coffee-500 mt-1">
                        Keep this key secret! Use it to authenticate your devices when sending data.
                      </p>
                    </div>

                    <div className="mb-5">
                      <h3 className="text-md font-medium text-coffee-800 mb-2">Fields</h3>
                      <div className="bg-beige-100 p-3 rounded-md">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-coffee-600">
                              <th className="py-1 pr-2">Field ID</th>
                              <th className="py-1">Name</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedChannel.fields.map((field: any, index: number) => (
                              <tr key={field.id} className="border-t border-beige-200">
                                <td className="py-1.5 pr-2 font-mono text-coffee-700">field{index + 1}</td>
                                <td className="py-1.5 text-coffee-800">{field.name}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-md font-medium text-coffee-800 mb-2">Endpoints</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center text-coffee-800 font-medium mb-1">
                            <Send size={16} className="mr-1 text-coffee-600" />
                            Update Channel Data
                          </div>
                          <div className="bg-beige-100 p-3 rounded-md font-mono text-sm text-coffee-700">
                            <div className="flex items-center">
                              <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-xs mr-2">POST</span>
                              <code>{formatApiUrl(`/api/v1/channels/${selectedChannel.id}/update`)}</code>
                            </div>
                          </div>
                          <p className="text-xs text-coffee-500 mt-1">
                            Send data to update field values in this channel
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex items-center text-coffee-800 font-medium mb-1">
                            <Smartphone size={16} className="mr-1 text-coffee-600" /> 
                            Get Channel Data
                          </div>
                          <div className="bg-beige-100 p-3 rounded-md font-mono text-sm text-coffee-700">
                            <div className="flex items-center">
                              <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs mr-2">GET</span>
                              <code>{formatApiUrl(`/api/v1/channels/${selectedChannel.id}`)}</code>
                            </div>
                          </div>
                          <p className="text-xs text-coffee-500 mt-1">
                            Retrieve all data for this channel (requires authentication)
                          </p>
                        </div>
                        
                        <div>
                          <div className="flex items-center text-coffee-800 font-medium mb-1">
                            <FileJson size={16} className="mr-1 text-coffee-600" />
                            Get Field Data
                          </div>
                          <div className="bg-beige-100 p-3 rounded-md font-mono text-sm text-coffee-700">
                            <div className="flex items-center">
                              <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-xs mr-2">GET</span>
                              <code>{formatApiUrl(`/api/v1/channels/${selectedChannel.id}/fields/1`)}</code>
                            </div>
                          </div>
                          <p className="text-xs text-coffee-500 mt-1">
                            Retrieve data for a specific field (replace "1" with field number)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-5 border-b border-beige-200">
                    <h2 className="text-lg font-medium text-coffee-800">Code Examples</h2>
                    <p className="text-coffee-600 text-sm">
                      Here are some examples of how to send data to your channel
                    </p>
                  </div>

                  <div className="p-5">
                    <div className="flex border-b border-beige-200 mb-4">
                      <button
                        className={`px-4 py-2 font-medium text-sm ${
                          selectedTab === 'http' 
                            ? 'text-coffee-800 border-b-2 border-coffee-600' 
                            : 'text-coffee-500 hover:text-coffee-700'
                        }`}
                        onClick={() => setSelectedTab('http')}
                      >
                        HTTP
                      </button>
                      <button
                        className={`px-4 py-2 font-medium text-sm ${
                          selectedTab === 'node' 
                            ? 'text-coffee-800 border-b-2 border-coffee-600' 
                            : 'text-coffee-500 hover:text-coffee-700'
                        }`}
                        onClick={() => setSelectedTab('node')}
                      >
                        Node.js
                      </button>
                      <button
                        className={`px-4 py-2 font-medium text-sm ${
                          selectedTab === 'python' 
                            ? 'text-coffee-800 border-b-2 border-coffee-600' 
                            : 'text-coffee-500 hover:text-coffee-700'
                        }`}
                        onClick={() => setSelectedTab('python')}
                      >
                        Python
                      </button>
                      <button
                        className={`px-4 py-2 font-medium text-sm ${
                          selectedTab === 'curl' 
                            ? 'text-coffee-800 border-b-2 border-coffee-600' 
                            : 'text-coffee-500 hover:text-coffee-700'
                        }`}
                        onClick={() => setSelectedTab('curl')}
                      >
                        cURL
                      </button>
                    </div>

                    <div className="relative">
                      <pre className="bg-coffee-800 text-beige-100 p-4 rounded-md overflow-x-auto text-sm">
                        <code>{examples[selectedTab]}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(examples[selectedTab], selectedTab)}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-beige-100 bg-opacity-20 hover:bg-opacity-30 text-beige-100 transition-colors"
                      >
                        {copiedCode === selectedTab ? (
                          <span className="text-xs font-medium">Copied!</span>
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-5 border-b border-beige-200">
                    <h2 className="text-lg font-medium text-coffee-800">Test Your API</h2>
                    <p className="text-coffee-600 text-sm">
                      Use this tool to quickly test sending data to your channel
                    </p>
                  </div>

                  <div className="p-5">
                    <ApiTester channelId={selectedChannel.id} apiKey={selectedChannel.apiKey} fields={selectedChannel.fields} />
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="flex flex-col items-center justify-center p-10 text-center h-96">
                <Code size={48} className="text-coffee-400 mb-4" />
                <h2 className="text-xl font-medium text-coffee-800 mb-2">Select a Channel</h2>
                <p className="text-coffee-600 max-w-md">
                  Choose a channel from the sidebar to view its API documentation and code examples
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

// API Tester Component
const ApiTester: React.FC<{
  channelId: string;
  apiKey: string;
  fields: any[];
}> = ({ channelId, apiKey, fields }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<{[key: string]: string}>({});
  
  const handleFieldChange = (fieldNumber: number, value: string) => {
    setFieldValues({
      ...fieldValues,
      [`field${fieldNumber}`]: value
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      // Convert string values to numbers
      const dataToSend: any = {};
      Object.entries(fieldValues).forEach(([key, value]) => {
        if (value) {
          dataToSend[key] = parseFloat(value);
        }
      });
      
      // Use the FastAPI backend URL
      const url = `${FASTAPI_BASE_URL}/api/v1/channels/${channelId}/update`;
      
      console.log(`Sending test data to: ${url}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify(dataToSend)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.slice(0, 8).map((field, index) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-coffee-700 mb-1">
                {field.name} (field{index + 1})
              </label>
              <input
                type="number"
                step="0.01"
                className="w-full px-3 py-2 bg-beige-100 border border-beige-300 rounded-md shadow-sm focus:outline-none focus:ring-coffee-500 focus:border-coffee-500 text-coffee-800"
                placeholder={`Value for ${field.name}`}
                value={fieldValues[`field${index + 1}`] || ''}
                onChange={(e) => handleFieldChange(index + 1, e.target.value)}
              />
            </div>
          ))}
        </div>
        
        <Button
          type="submit"
          leftIcon={loading ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Data'}
        </Button>
      </form>
      
      {error && (
        <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-md">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {result && (
        <div className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-md">
          <p className="font-medium">Success!</p>
          <pre className="text-sm mt-2 overflow-x-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiDocumentation;