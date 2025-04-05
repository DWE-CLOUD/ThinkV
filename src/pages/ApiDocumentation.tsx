import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  FileJson, 
  ChevronDown, 
  Copy, 
  ExternalLink, 
  AlertCircle, 
  Server, 
  Key,
  Cpu,
  Database,
  ArrowRight,
  Code
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ApiDocumentation: React.FC = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const [activeSection, setActiveSection] = useState<string>('introduction');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
  const { channels, selectedChannel, setSelectedChannel } = useAppContext();
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const tocRef = useRef<HTMLDivElement>(null);

  // Find the channel based on the URL param or use selected channel
  useEffect(() => {
    if (channelId && channels.length > 0) {
      const channel = channels.find(c => c.id === channelId);
      if (channel) {
        setSelectedChannel(channel);
      }
    }
  }, [channelId, channels, setSelectedChannel]);

  // Set up intersection observer for scrollspy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.1, rootMargin: "-100px 0px -80% 0px" }
    );
    
    // Observe all section elements
    Object.keys(sectionRefs.current).forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        sectionRefs.current[id] = el;
        observer.observe(el);
      }
    });
    
    return () => {
      Object.values(sectionRefs.current).forEach((el) => {
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  // Endpoints documentation
  const apiEndpoints = [
    {
      id: 'update-channel',
      name: 'Update Channel Data',
      method: 'POST',
      url: `/api/v1/channels/{channelId}/update`,
      description: 'Send data to a channel. Used by IoT devices to update field values.',
      params: [
        { name: 'channelId', type: 'string', required: true, description: 'The ID of the channel' }
      ],
      headers: [
        { name: 'Content-Type', value: 'application/json', required: true },
        { name: 'X-API-Key', value: 'YOUR_API_KEY', required: true, description: 'The API key for the channel' }
      ],
      body: {
        field1: 23.5,
        field2: 45.2,
        timestamp: '2023-01-01T12:34:56Z' // Optional
      },
      response: {
        success: true,
        channel_id: 'channel-id',
        timestamp: '2023-01-01T12:34:56Z',
        entry_id: 12345,
        points_added: 2
      },
      example: `
// Using fetch API
const apiKey = "YOUR_API_KEY";
const url = "https://api.thinkv.io/v1/channels/YOUR_CHANNEL_ID/update";

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey
  },
  body: JSON.stringify({
    field1: 23.5,
    field2: 45.2
  })
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));`,
      pythonExample: `
import requests
import json

url = "https://api.thinkv.io/v1/channels/YOUR_CHANNEL_ID/update"
headers = {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
}
data = {
    'field1': 23.5,
    'field2': 45.2
}

response = requests.post(url, headers=headers, json=data)
print(response.json())`
    },
    {
      id: 'get-channel',
      name: 'Get Channel Information',
      method: 'GET',
      url: `/api/v1/channels/{channelId}`,
      description: 'Retrieve information about a channel, including metadata and current field values.',
      params: [
        { name: 'channelId', type: 'string', required: true, description: 'The ID of the channel' }
      ],
      headers: [
        { name: 'X-API-Key', value: 'YOUR_API_KEY', required: true, description: 'The API key for the channel' }
      ],
      response: {
        id: 'channel-id',
        name: 'My Weather Station',
        description: 'Indoor conditions monitor',
        created_at: '2023-01-01T00:00:00Z',
        fields: {
          1: {
            name: 'Temperature',
            value: 23.5,
            last_updated: '2023-01-01T12:34:56Z'
          },
          2: {
            name: 'Humidity',
            value: 45.2,
            last_updated: '2023-01-01T12:34:56Z'
          }
        }
      },
      example: `
// Using fetch API
const apiKey = "YOUR_API_KEY";
const url = "https://api.thinkv.io/v1/channels/YOUR_CHANNEL_ID";

fetch(url, {
  method: 'GET',
  headers: {
    'X-API-Key': apiKey
  }
})
.then(response => response.json())
.then(data => console.log('Channel data:', data))
.catch(error => console.error('Error:', error));`,
      pythonExample: `
import requests

url = "https://api.thinkv.io/v1/channels/YOUR_CHANNEL_ID"
headers = {
    'X-API-Key': 'YOUR_API_KEY'
}

response = requests.get(url, headers=headers)
print(response.json())`
    },
    {
      id: 'get-field-data',
      name: 'Get Field Data',
      method: 'GET',
      url: `/api/v1/channels/{channelId}/fields/{fieldId}`,
      description: 'Retrieve historical data for a specific field in a channel.',
      params: [
        { name: 'channelId', type: 'string', required: true, description: 'The ID of the channel' },
        { name: 'fieldId', type: 'string', required: true, description: 'The ID of the field' }
      ],
      queryParams: [
        { name: 'results', type: 'integer', required: false, default: 100, description: 'Number of data points to return' },
        { name: 'start', type: 'ISO datetime', required: false, description: 'Start time for data range' },
        { name: 'end', type: 'ISO datetime', required: false, description: 'End time for data range' }
      ],
      headers: [
        { name: 'X-API-Key', value: 'YOUR_API_KEY', required: true, description: 'The API key for the channel' }
      ],
      response: [
        {
          timestamp: '2023-01-01T12:34:56Z',
          value: 23.5
        },
        {
          timestamp: '2023-01-01T12:24:56Z',
          value: 23.4
        }
      ],
      example: `
// Using fetch API
const apiKey = "YOUR_API_KEY";
const url = "https://api.thinkv.io/v1/channels/YOUR_CHANNEL_ID/fields/1?results=50";

fetch(url, {
  method: 'GET',
  headers: {
    'X-API-Key': apiKey
  }
})
.then(response => response.json())
.then(data => console.log('Field data:', data))
.catch(error => console.error('Error:', error));`,
      pythonExample: `
import requests

url = "https://api.thinkv.io/v1/channels/YOUR_CHANNEL_ID/fields/1"
headers = {
    'X-API-Key': 'YOUR_API_KEY'
}
params = {
    'results': 50
}

response = requests.get(url, headers=headers, params=params)
print(response.json())`
    },
    {
      id: 'bulk-update',
      name: 'Bulk Update',
      method: 'POST',
      url: `/api/v1/channels/{channelId}/bulk_update`,
      description: 'Send multiple data points to a channel in a single request, useful for batch processing or uploading historical data.',
      params: [
        { name: 'channelId', type: 'string', required: true, description: 'The ID of the channel' }
      ],
      headers: [
        { name: 'Content-Type', value: 'application/json', required: true },
        { name: 'X-API-Key', value: 'YOUR_API_KEY', required: true, description: 'The API key for the channel' }
      ],
      body: [
        {
          field1: 23.5,
          field2: 45.2,
          timestamp: '2023-01-01T12:34:56Z'
        },
        {
          field1: 23.4,
          field2: 45.1,
          timestamp: '2023-01-01T12:24:56Z'
        }
      ],
      response: {
        success: true,
        channel_id: 'channel-id',
        points_added: 4
      },
      example: `
// Using fetch API
const apiKey = "YOUR_API_KEY";
const url = "https://api.thinkv.io/v1/channels/YOUR_CHANNEL_ID/bulk_update";

const data = [
  {
    field1: 23.5,
    field2: 45.2,
    timestamp: '2023-01-01T12:34:56Z'
  },
  {
    field1: 23.4,
    field2: 45.1,
    timestamp: '2023-01-01T12:24:56Z'
  }
];

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': apiKey
  },
  body: JSON.stringify(data)
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));`,
      pythonExample: `
import requests
import json

url = "https://api.thinkv.io/v1/channels/YOUR_CHANNEL_ID/bulk_update"
headers = {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY'
}
data = [
    {
        'field1': 23.5,
        'field2': 45.2,
        'timestamp': '2023-01-01T12:34:56Z'
    },
    {
        'field1': 23.4,
        'field2': 45.1,
        'timestamp': '2023-01-01T12:24:56Z'
    }
]

response = requests.post(url, headers=headers, json=data)
print(response.json())`
    }
  ];

  // Extract the endpoint information if we have a selected endpoint
  const selectedEndpointInfo = selectedEndpoint
    ? apiEndpoints.find(endpoint => endpoint.id === selectedEndpoint)
    : null;

  // Toggle the endpoint
  const toggleEndpoint = (endpointId: string) => {
    if (selectedEndpoint === endpointId) {
      setSelectedEndpoint(null);
    } else {
      setSelectedEndpoint(endpointId);
    }
  };

  return (
    <div className="min-h-screen bg-beige-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center mb-2">
              <FileJson className="text-coffee-600 mr-2" />
              <h1 className="text-2xl font-bold text-coffee-800">API Documentation</h1>
            </div>
            <p className="text-coffee-600">Comprehensive documentation for the ThinkV API</p>
          </div>
          
          {selectedChannel && (
            <div className="bg-beige-50 border border-beige-200 rounded-lg p-3 shadow-warm">
              <div className="text-xs text-coffee-500 mb-1">Current Channel</div>
              <div className="font-medium text-coffee-800">{selectedChannel.name}</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Table of Contents */}
          <div className="lg:col-span-3">
            <div className="lg:sticky lg:top-24">
              <Card className="overflow-hidden mb-6">
                <div className="p-4 border-b border-beige-200 bg-coffee-800 text-beige-50">
                  <h2 className="font-medium">API Reference</h2>
                </div>
                <div className="max-h-[70vh] overflow-y-auto" ref={tocRef}>
                  <ul className="divide-y divide-beige-200">
                    <li>
                      <a
                        href="#introduction"
                        className={`flex items-center px-4 py-3 hover:bg-beige-100 transition-colors ${
                          activeSection === 'introduction' ? 'bg-beige-100 border-l-4 border-coffee-600 text-coffee-800 font-medium' : 'text-coffee-600'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById('introduction')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <FileJson size={16} className="mr-2" />
                        Introduction
                      </a>
                    </li>
                    <li>
                      <a
                        href="#authentication"
                        className={`flex items-center px-4 py-3 hover:bg-beige-100 transition-colors ${
                          activeSection === 'authentication' ? 'bg-beige-100 border-l-4 border-coffee-600 text-coffee-800 font-medium' : 'text-coffee-600'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById('authentication')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <Key size={16} className="mr-2" />
                        Authentication
                      </a>
                    </li>
                    <li>
                      <a
                        href="#channels"
                        className={`flex items-center px-4 py-3 hover:bg-beige-100 transition-colors ${
                          activeSection === 'channels' ? 'bg-beige-100 border-l-4 border-coffee-600 text-coffee-800 font-medium' : 'text-coffee-600'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById('channels')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <Database size={16} className="mr-2" />
                        Channels
                      </a>
                    </li>
                    <li>
                      <a
                        href="#endpoints"
                        className={`flex items-center px-4 py-3 hover:bg-beige-100 transition-colors ${
                          activeSection === 'endpoints' ? 'bg-beige-100 border-l-4 border-coffee-600 text-coffee-800 font-medium' : 'text-coffee-600'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById('endpoints')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <Server size={16} className="mr-2" />
                        Endpoints
                      </a>
                    </li>
                    <li>
                      <a
                        href="#errors"
                        className={`flex items-center px-4 py-3 hover:bg-beige-100 transition-colors ${
                          activeSection === 'errors' ? 'bg-beige-100 border-l-4 border-coffee-600 text-coffee-800 font-medium' : 'text-coffee-600'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById('errors')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <AlertCircle size={16} className="mr-2" />
                        Error Handling
                      </a>
                    </li>
                    <li>
                      <a
                        href="#client-libraries"
                        className={`flex items-center px-4 py-3 hover:bg-beige-100 transition-colors ${
                          activeSection === 'client-libraries' ? 'bg-beige-100 border-l-4 border-coffee-600 text-coffee-800 font-medium' : 'text-coffee-600'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById('client-libraries')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <Code size={16} className="mr-2" />
                        Client Libraries
                      </a>
                    </li>
                  </ul>
                </div>
              </Card>

              {/* Channel API Key Card */}
              {selectedChannel && (
                <Card className="overflow-hidden mb-6">
                  <div className="p-4 border-b border-beige-200 bg-coffee-700 text-beige-50">
                    <h2 className="font-medium flex items-center">
                      <Key size={16} className="mr-2" />
                      Your API Key
                    </h2>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-coffee-500 mb-1">Channel</div>
                    <div className="font-medium text-coffee-800 mb-3">{selectedChannel.name}</div>
                    
                    <div className="text-xs text-coffee-500 mb-1">API Key</div>
                    <div className="relative mb-3">
                      <input
                        type="password"
                        value={selectedChannel.apiKey || '••••••••••••••••••••••'}
                        readOnly
                        className="w-full pr-8 px-3 py-2 bg-beige-100 border border-beige-300 rounded-md text-coffee-800 font-mono text-sm"
                      />
                      <button 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-coffee-500 hover:text-coffee-700"
                        onClick={() => {
                          if (selectedChannel.apiKey) {
                            navigator.clipboard.writeText(selectedChannel.apiKey);
                          }
                        }}
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    
                    <div className="text-xs text-coffee-600 bg-beige-100 p-2 rounded border border-beige-200">
                      Include this API key in your requests to authenticate with the ThinkV API.
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Main Documentation Content */}
          <div className="lg:col-span-9">
            <Card>
              <div className="space-y-12 py-6">
                {/* Introduction Section */}
                <section 
                  id="introduction" 
                  className="px-6"
                  ref={(el) => (sectionRefs.current['introduction'] = el)}
                >
                  <h2 className="text-2xl font-bold text-coffee-800 mb-4">Introduction</h2>
                  <p className="text-coffee-700 mb-6">
                    The ThinkV API is a RESTful interface that allows you to programmatically interact with your IoT devices and data. 
                    You can use the API to send data from devices, retrieve historical data, create and manage channels, and more.
                  </p>
                  
                  <div className="bg-beige-100 border border-beige-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-coffee-700 mb-2">Base URL</h3>
                    <div className="bg-beige-50 p-3 rounded border border-beige-300 font-mono text-sm text-coffee-800">
                      https://api.thinkv.io/v1
                    </div>
                    <p className="text-sm text-coffee-600 mt-2">
                      All API requests should be made to this base URL, followed by the specific endpoint path.
                    </p>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-coffee-800 mb-3">Content Type</h3>
                  <p className="text-coffee-700 mb-4">
                    The API accepts and returns JSON data. All requests should include the appropriate content type header:
                  </p>
                  <div className="bg-beige-50 p-3 rounded border border-beige-300 font-mono text-sm text-coffee-800 mb-6">
                    Content-Type: application/json
                  </div>
                  
                  <h3 className="text-xl font-semibold text-coffee-800 mb-3">Rate Limits</h3>
                  <p className="text-coffee-700 mb-4">
                    The API has rate limits to ensure fair usage. Standard accounts are limited to 60 requests per minute.
                    Rate limit information is included in the response headers:
                  </p>
                  <ul className="list-disc pl-6 text-coffee-700 mb-6">
                    <li className="mb-1"><code className="font-mono text-coffee-800">X-RateLimit-Limit</code>: Maximum number of requests allowed per minute</li>
                    <li className="mb-1"><code className="font-mono text-coffee-800">X-RateLimit-Remaining</code>: Number of requests remaining in the current window</li>
                    <li className="mb-1"><code className="font-mono text-coffee-800">X-RateLimit-Reset</code>: Time in seconds when the rate limit will reset</li>
                  </ul>
                </section>
                
                {/* Authentication Section */}
                <section 
                  id="authentication" 
                  className="px-6 border-t border-beige-200 pt-12"
                  ref={(el) => (sectionRefs.current['authentication'] = el)}
                >
                  <h2 className="text-2xl font-bold text-coffee-800 mb-4">Authentication</h2>
                  <p className="text-coffee-700 mb-6">
                    The ThinkV API uses API keys to authenticate requests. You can view and manage your API keys from the channel details page.
                  </p>
                  
                  <div className="bg-beige-100 border border-beige-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-coffee-700 mb-2">API Key Authentication</h3>
                    <p className="text-coffee-700 mb-3">
                      Include your API key in the request headers:
                    </p>
                    <div className="bg-beige-50 p-3 rounded border border-beige-300 font-mono text-sm text-coffee-800">
                      X-API-Key: YOUR_API_KEY
                    </div>
                  </div>
                  
                  <div className="bg-beige-100 border border-beige-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-coffee-700 mb-2">Query Parameter Authentication</h3>
                    <p className="text-coffee-700 mb-3">
                      Alternatively, you can include your API key as a query parameter (less secure but useful for simple devices):
                    </p>
                    <div className="bg-beige-50 p-3 rounded border border-beige-300 font-mono text-sm text-coffee-800">
                      https://api.thinkv.io/v1/channels/YOUR_CHANNEL_ID/update?api_key=YOUR_API_KEY
                    </div>
                  </div>
                  
                  <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-rose-700 mb-2 flex items-center">
                      <AlertCircle size={18} className="mr-2" />
                      Security Warning
                    </h3>
                    <p className="text-rose-700">
                      Keep your API keys secure and never expose them in client-side code. If you suspect an API key has been compromised, 
                      you should regenerate it immediately from the channel details page.
                    </p>
                  </div>
                </section>
                
                {/* Channels Section - Highlighted for better visibility */}
                <section 
                  id="channels" 
                  className="px-6 border-t border-beige-200 pt-12 bg-beige-50 rounded-xl"
                  ref={(el) => (sectionRefs.current['channels'] = el)}
                >
                  <div className="px-4 py-2 bg-coffee-700 text-beige-50 inline-block rounded-t-lg -mt-12 mb-4">
                    <h2 className="text-2xl font-bold flex items-center">
                      <Database size={20} className="mr-2" />
                      Channels
                    </h2>
                  </div>
                  
                  <p className="text-coffee-700 mb-6">
                    Channels are the primary organizational units in ThinkV. Each channel represents a device or a 
                    collection of related data sources. Understanding channel structure is essential for using the API effectively.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-beige-100 border border-beige-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-coffee-700 mb-2">Channel Components</h3>
                      <ul className="list-disc pl-6 text-coffee-700">
                        <li className="mb-2"><strong>Channel ID</strong>: A unique identifier for the channel</li>
                        <li className="mb-2"><strong>API Key</strong>: Used to authenticate requests to the channel</li>
                        <li className="mb-2"><strong>Fields</strong>: Data points collected within the channel (e.g., temperature, humidity)</li>
                        <li className="mb-2"><strong>Metadata</strong>: Channel name, description, and other properties</li>
                      </ul>
                    </div>
                    
                    <div className="bg-beige-100 border border-beige-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-coffee-700 mb-2">Field Structure</h3>
                      <ul className="list-disc pl-6 text-coffee-700">
                        <li className="mb-2"><strong>Field ID</strong>: Unique identifier within the channel</li>
                        <li className="mb-2"><strong>Field Number</strong>: Index (1-based) used in API requests (e.g., field1, field2)</li>
                        <li className="mb-2"><strong>Name</strong>: Human-readable name for the field</li>
                        <li className="mb-2"><strong>Unit</strong>: Optional unit of measurement</li>
                      </ul>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-coffee-800 mb-3">Channel JSON Structure</h3>
                  <p className="text-coffee-700 mb-4">
                    When retrieving channel information, the API returns a JSON object with the following structure:
                  </p>
                  <div className="bg-coffee-800 text-beige-100 p-4 rounded-lg mb-6 overflow-x-auto">
                    <pre className="text-sm">
{`{
  "id": "channel-uuid",
  "name": "My Weather Station",
  "description": "Indoor conditions monitor",
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T12:34:56Z",
  "is_public": true,
  "tags": ["weather", "indoor"],
  "fields": {
    "1": {
      "name": "Temperature",
      "value": 23.5,
      "last_updated": "2023-01-01T12:34:56Z"
    },
    "2": {
      "name": "Humidity",
      "value": 45.2,
      "last_updated": "2023-01-01T12:34:56Z"
    }
  }
}`}
                    </pre>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-coffee-800 mb-3">Working with Fields</h3>
                  <p className="text-coffee-700 mb-4">
                    When sending data to a channel, you reference fields by their field number using the format <code className="font-mono text-coffee-800">field1</code>, <code className="font-mono text-coffee-800">field2</code>, etc.
                  </p>
                  <div className="bg-coffee-800 text-beige-100 p-4 rounded-lg mb-6 overflow-x-auto">
                    <pre className="text-sm">
{`// Example of updating field values
{
  "field1": 23.5,
  "field2": 45.2
}`}
                    </pre>
                  </div>
                  
                  <div className="flex justify-center my-6">
                    <Button
                      leftIcon={<ArrowRight size={16} />}
                      className="bg-coffee-600 hover:bg-coffee-700"
                      onClick={() => {
                        document.getElementById('endpoints')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      View API Endpoints
                    </Button>
                  </div>
                </section>
                
                {/* Endpoints Section */}
                <section 
                  id="endpoints" 
                  className="px-6 border-t border-beige-200 pt-12"
                  ref={(el) => (sectionRefs.current['endpoints'] = el)}
                >
                  <h2 className="text-2xl font-bold text-coffee-800 mb-4">API Endpoints</h2>
                  <p className="text-coffee-700 mb-6">
                    The ThinkV API provides the following endpoints for interacting with channels and data.
                  </p>
                  
                  <div className="space-y-4 mb-6">
                    {apiEndpoints.map((endpoint) => (
                      <div key={endpoint.id} className="border border-beige-200 rounded-lg overflow-hidden">
                        <button
                          className="w-full flex items-center justify-between p-4 bg-beige-100 hover:bg-beige-200 transition-colors text-left"
                          onClick={() => toggleEndpoint(endpoint.id)}
                        >
                          <div className="flex items-center">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold mr-3 ${
                              endpoint.method === 'GET' ? 'bg-emerald-100 text-emerald-800' : 
                              endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' : 
                              endpoint.method === 'PUT' ? 'bg-amber-100 text-amber-800' : 
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {endpoint.method}
                            </span>
                            <span className="font-medium text-coffee-800">{endpoint.name}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-coffee-500 font-mono mr-2">{endpoint.url}</span>
                            <ChevronDown
                              size={18}
                              className={`transform transition-transform ${selectedEndpoint === endpoint.id ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </button>
                        
                        <AnimatePresence>
                          {selectedEndpoint === endpoint.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="border-t border-beige-200"
                            >
                              <div className="p-4 bg-beige-50">
                                <p className="text-coffee-700 mb-4">{endpoint.description}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                  {/* URL Parameters */}
                                  {endpoint.params && endpoint.params.length > 0 && (
                                    <div className="space-y-2">
                                      <h4 className="font-medium text-coffee-800">URL Parameters</h4>
                                      <div className="bg-beige-100 rounded-lg p-3 border border-beige-200">
                                        <ul className="space-y-2">
                                          {endpoint.params.map((param) => (
                                            <li key={param.name} className="text-sm">
                                              <span className="font-mono text-coffee-800">{param.name}</span>
                                              <span className="text-xs bg-coffee-200 text-coffee-800 rounded px-1 ml-2">{param.type}</span>
                                              {param.required && (
                                                <span className="text-xs bg-rose-100 text-rose-800 rounded px-1 ml-1">required</span>
                                              )}
                                              {param.description && (
                                                <p className="text-coffee-600 mt-1">{param.description}</p>
                                              )}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Query Parameters */}
                                  {endpoint.queryParams && endpoint.queryParams.length > 0 && (
                                    <div className="space-y-2">
                                      <h4 className="font-medium text-coffee-800">Query Parameters</h4>
                                      <div className="bg-beige-100 rounded-lg p-3 border border-beige-200">
                                        <ul className="space-y-2">
                                          {endpoint.queryParams.map((param) => (
                                            <li key={param.name} className="text-sm">
                                              <span className="font-mono text-coffee-800">{param.name}</span>
                                              <span className="text-xs bg-coffee-200 text-coffee-800 rounded px-1 ml-2">{param.type}</span>
                                              {param.required && (
                                                <span className="text-xs bg-rose-100 text-rose-800 rounded px-1 ml-1">required</span>
                                              )}
                                              {param.default && (
                                                <span className="text-xs bg-beige-300 text-coffee-800 rounded px-1 ml-1">default: {param.default}</span>
                                              )}
                                              {param.description && (
                                                <p className="text-coffee-600 mt-1">{param.description}</p>
                                              )}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Headers */}
                                  {endpoint.headers && endpoint.headers.length > 0 && (
                                    <div className="space-y-2">
                                      <h4 className="font-medium text-coffee-800">Headers</h4>
                                      <div className="bg-beige-100 rounded-lg p-3 border border-beige-200">
                                        <ul className="space-y-2">
                                          {endpoint.headers.map((header) => (
                                            <li key={header.name} className="text-sm">
                                              <div className="flex items-center">
                                                <span className="font-mono text-coffee-800">{header.name}</span>
                                                {header.required && (
                                                  <span className="text-xs bg-rose-100 text-rose-800 rounded px-1 ml-2">required</span>
                                                )}
                                              </div>
                                              <div className="mt-1 font-mono text-xs bg-beige-200 p-1 rounded">
                                                {header.value}
                                              </div>
                                              {header.description && (
                                                <p className="text-coffee-600 mt-1 text-xs">{header.description}</p>
                                              )}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Request Body */}
                                {endpoint.body && (
                                  <div className="mb-6">
                                    <h4 className="font-medium text-coffee-800 mb-2">Request Body</h4>
                                    <div className="bg-coffee-800 text-beige-100 p-3 rounded-lg overflow-x-auto">
                                      <pre className="text-sm">
                                        {JSON.stringify(endpoint.body, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Response */}
                                {endpoint.response && (
                                  <div className="mb-6">
                                    <h4 className="font-medium text-coffee-800 mb-2">Response</h4>
                                    <div className="bg-coffee-800 text-beige-100 p-3 rounded-lg overflow-x-auto">
                                      <pre className="text-sm">
                                        {JSON.stringify(endpoint.response, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Examples */}
                                <div className="space-y-4">
                                  <h4 className="font-medium text-coffee-800">Example</h4>
                                  
                                  <div className="bg-coffee-800 text-beige-100 p-3 rounded-lg mb-4 overflow-x-auto">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs text-beige-300">JavaScript</span>
                                      <button
                                        className="text-beige-300 hover:text-beige-100"
                                        onClick={() => {
                                          navigator.clipboard.writeText(endpoint.example);
                                        }}
                                      >
                                        <Copy size={14} />
                                      </button>
                                    </div>
                                    <pre className="text-sm">
                                      {endpoint.example}
                                    </pre>
                                  </div>
                                  
                                  <div className="bg-coffee-800 text-beige-100 p-3 rounded-lg overflow-x-auto">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-xs text-beige-300">Python</span>
                                      <button
                                        className="text-beige-300 hover:text-beige-100"
                                        onClick={() => {
                                          navigator.clipboard.writeText(endpoint.pythonExample);
                                        }}
                                      >
                                        <Copy size={14} />
                                      </button>
                                    </div>
                                    <pre className="text-sm">
                                      {endpoint.pythonExample}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </section>
                
                {/* Error Handling Section */}
                <section 
                  id="errors" 
                  className="px-6 border-t border-beige-200 pt-12"
                  ref={(el) => (sectionRefs.current['errors'] = el)}
                >
                  <h2 className="text-2xl font-bold text-coffee-800 mb-4">Error Handling</h2>
                  <p className="text-coffee-700 mb-6">
                    The API returns standard HTTP status codes and JSON error responses to indicate the success or failure of a request.
                  </p>
                  
                  <h3 className="text-xl font-semibold text-coffee-800 mb-3">HTTP Status Codes</h3>
                  <div className="bg-beige-100 rounded-lg p-4 border border-beige-200 mb-6">
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <span className="font-mono bg-emerald-100 text-emerald-800 rounded px-2 py-0.5 mr-3 text-xs">200</span>
                        <div>
                          <span className="font-medium text-coffee-800">OK</span>
                          <p className="text-coffee-600 text-sm">The request was successful</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="font-mono bg-amber-100 text-amber-800 rounded px-2 py-0.5 mr-3 text-xs">400</span>
                        <div>
                          <span className="font-medium text-coffee-800">Bad Request</span>
                          <p className="text-coffee-600 text-sm">The request was invalid or missing required parameters</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="font-mono bg-rose-100 text-rose-800 rounded px-2 py-0.5 mr-3 text-xs">401</span>
                        <div>
                          <span className="font-medium text-coffee-800">Unauthorized</span>
                          <p className="text-coffee-600 text-sm">Missing or invalid API key</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="font-mono bg-rose-100 text-rose-800 rounded px-2 py-0.5 mr-3 text-xs">403</span>
                        <div>
                          <span className="font-medium text-coffee-800">Forbidden</span>
                          <p className="text-coffee-600 text-sm">Valid API key but insufficient permissions</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="font-mono bg-rose-100 text-rose-800 rounded px-2 py-0.5 mr-3 text-xs">404</span>
                        <div>
                          <span className="font-medium text-coffee-800">Not Found</span>
                          <p className="text-coffee-600 text-sm">The requested resource was not found</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="font-mono bg-rose-100 text-rose-800 rounded px-2 py-0.5 mr-3 text-xs">429</span>
                        <div>
                          <span className="font-medium text-coffee-800">Too Many Requests</span>
                          <p className="text-coffee-600 text-sm">Rate limit exceeded</p>
                        </div>
                      </li>
                      <li className="flex items-start">
                        <span className="font-mono bg-rose-100 text-rose-800 rounded px-2 py-0.5 mr-3 text-xs">500</span>
                        <div>
                          <span className="font-medium text-coffee-800">Internal Server Error</span>
                          <p className="text-coffee-600 text-sm">An error occurred on the server</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-coffee-800 mb-3">Error Response Format</h3>
                  <p className="text-coffee-700 mb-4">
                    When an error occurs, the API returns a JSON object with an error message:
                  </p>
                  <div className="bg-coffee-800 text-beige-100 p-4 rounded-lg mb-6 overflow-x-auto">
                    <pre className="text-sm">
{`{
  "error": {
    "code": "invalid_api_key",
    "message": "The API key provided is invalid or missing",
    "status": 401,
    "details": "Please check your API key and try again"
  }
}`}
                    </pre>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-coffee-800 mb-3">Error Handling Best Practices</h3>
                  <div className="bg-beige-100 rounded-lg p-4 border border-beige-200 mb-6">
                    <ul className="list-disc pl-6 space-y-2 text-coffee-700">
                      <li>Always check the HTTP status code and error message in responses</li>
                      <li>Implement retry logic with exponential backoff for 429 and 5xx errors</li>
                      <li>Log error details to help with debugging</li>
                      <li>Consider implementing circuit breakers for handling persistent API outages</li>
                    </ul>
                  </div>
                </section>
                
                {/* Client Libraries Section */}
                <section 
                  id="client-libraries" 
                  className="px-6 border-t border-beige-200 pt-12"
                  ref={(el) => (sectionRefs.current['client-libraries'] = el)}
                >
                  <h2 className="text-2xl font-bold text-coffee-800 mb-4">Client Libraries</h2>
                  <p className="text-coffee-700 mb-6">
                    To simplify integration, ThinkV provides official client libraries for various programming languages.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-beige-100 border border-beige-200 rounded-lg p-4 hover:border-coffee-300 hover:shadow-warm transition-all">
                      <h3 className="text-lg font-semibold text-coffee-800 mb-2 flex items-center">
                        <div className="bg-beige-200 p-2 rounded-md mr-3">
                          <span className="text-coffee-800 font-mono">JS</span>
                        </div>
                        JavaScript / TypeScript
                      </h3>
                      <p className="text-coffee-700 mb-3">
                        Modern JavaScript library with TypeScript support for browsers and Node.js
                      </p>
                      <div className="bg-beige-200 p-2 rounded-md font-mono text-xs text-coffee-800 mb-3">
                        npm install thinkv-client
                      </div>
                      <a 
                        href="#" 
                        className="flex items-center text-coffee-600 hover:text-coffee-800 text-sm"
                      >
                        <ExternalLink size={16} className="mr-1" />
                        View Documentation
                      </a>
                    </div>
                    
                    <div className="bg-beige-100 border border-beige-200 rounded-lg p-4 hover:border-coffee-300 hover:shadow-warm transition-all">
                      <h3 className="text-lg font-semibold text-coffee-800 mb-2 flex items-center">
                        <div className="bg-beige-200 p-2 rounded-md mr-3">
                          <span className="text-coffee-800 font-mono">Py</span>
                        </div>
                        Python
                      </h3>
                      <p className="text-coffee-700 mb-3">
                        Python library with async support for Python 3.7+
                      </p>
                      <div className="bg-beige-200 p-2 rounded-md font-mono text-xs text-coffee-800 mb-3">
                        pip install thinkv-client
                      </div>
                      <a 
                        href="#" 
                        className="flex items-center text-coffee-600 hover:text-coffee-800 text-sm"
                      >
                        <ExternalLink size={16} className="mr-1" />
                        View Documentation
                      </a>
                    </div>
                    
                    <div className="bg-beige-100 border border-beige-200 rounded-lg p-4 hover:border-coffee-300 hover:shadow-warm transition-all">
                      <h3 className="text-lg font-semibold text-coffee-800 mb-2 flex items-center">
                        <div className="bg-beige-200 p-2 rounded-md mr-3">
                          <span className="text-coffee-800 font-mono">Go</span>
                        </div>
                        Golang
                      </h3>
                      <p className="text-coffee-700 mb-3">
                        Go client with concurrency support
                      </p>
                      <div className="bg-beige-200 p-2 rounded-md font-mono text-xs text-coffee-800 mb-3">
                        go get github.com/thinkv/thinkv-go
                      </div>
                      <a 
                        href="#" 
                        className="flex items-center text-coffee-600 hover:text-coffee-800 text-sm"
                      >
                        <ExternalLink size={16} className="mr-1" />
                        View Documentation
                      </a>
                    </div>
                    
                    <div className="bg-beige-100 border border-beige-200 rounded-lg p-4 hover:border-coffee-300 hover:shadow-warm transition-all">
                      <h3 className="text-lg font-semibold text-coffee-800 mb-2 flex items-center">
                        <div className="bg-beige-200 p-2 rounded-md mr-3">
                          <span className="text-coffee-800 font-mono">C</span>
                        </div>
                        Arduino / C++
                      </h3>
                      <p className="text-coffee-700 mb-3">
                        Lightweight client for Arduino and other embedded platforms
                      </p>
                      <div className="bg-beige-200 p-2 rounded-md font-mono text-xs text-coffee-800 mb-3">
                        Arduino Library Manager: Search for "ThinkV"
                      </div>
                      <a 
                        href="#" 
                        className="flex items-center text-coffee-600 hover:text-coffee-800 text-sm"
                      >
                        <ExternalLink size={16} className="mr-1" />
                        View Documentation
                      </a>
                    </div>
                  </div>
                  
                  <div className="bg-beige-100 border border-beige-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-semibold text-coffee-700 mb-2 flex items-center">
                      <Cpu size={18} className="mr-2" />
                      Device Code Examples
                    </h3>
                    <p className="text-coffee-700 mb-3">
                      Ready-to-use examples for popular IoT platforms:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <a href="#" className="text-coffee-600 hover:text-coffee-800 hover:bg-beige-200 p-2 rounded">
                        ESP8266 / ESP32
                      </a>
                      <a href="#" className="text-coffee-600 hover:text-coffee-800 hover:bg-beige-200 p-2 rounded">
                        Arduino (Ethernet)
                      </a>
                      <a href="#" className="text-coffee-600 hover:text-coffee-800 hover:bg-beige-200 p-2 rounded">
                        Arduino (WiFi)
                      </a>
                      <a href="#" className="text-coffee-600 hover:text-coffee-800 hover:bg-beige-200 p-2 rounded">
                        Raspberry Pi (Python)
                      </a>
                      <a href="#" className="text-coffee-600 hover:text-coffee-800 hover:bg-beige-200 p-2 rounded">
                        Raspberry Pi (Node.js)
                      </a>
                      <a href="#" className="text-coffee-600 hover:text-coffee-800 hover:bg-beige-200 p-2 rounded">
                        MicroPython
                      </a>
                    </div>
                  </div>
                </section>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocumentation