import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  FileText, 
  Code, 
  Cpu, 
  Server, 
  ArrowRight, 
  FileJson, 
  ExternalLink, 
  Link as LinkIcon, 
  BookOpen, 
  ChevronRight,
  PanelTop,
  BarChart2,
  Zap,
  Wifi,
  Settings,
  Activity,
  Cloud,
  Smartphone,
  Share2,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Documentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('introduction');
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const tocRef = useRef<HTMLDivElement>(null);
  
  // Define the documentation sections
  const docSections = [
    { id: 'introduction', title: 'Introduction', icon: <BookOpen size={16} className="mr-2" /> },
    { id: 'getting-started', title: 'Getting Started', icon: <Zap size={16} className="mr-2" /> },
    { id: 'channels', title: 'Channels', icon: <Cloud size={16} className="mr-2" /> },
    { id: 'dashboard', title: 'Dashboard', icon: <PanelTop size={16} className="mr-2" /> },
    { id: 'charts', title: 'Charts & Visualization', icon: <BarChart2 size={16} className="mr-2" /> },
    { id: 'devices', title: 'Device Integration', icon: <Cpu size={16} className="mr-2" /> },
    { id: 'api', title: 'API Overview', icon: <FileJson size={16} className="mr-2" /> },
    { id: 'simulator', title: 'Device Simulator', icon: <Smartphone size={16} className="mr-2" /> },
    { id: 'settings', title: 'Account Settings', icon: <Settings size={16} className="mr-2" /> },
    { id: 'faqs', title: 'FAQs', icon: <HelpCircle size={16} className="mr-2" /> },
  ];

  // Track section visibility for navigation highlighting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActiveSection(id);
            
            // Scroll the ToC to make the active item visible if needed
            if (tocRef.current) {
              const activeItem = tocRef.current.querySelector(`a[href="#${id}"]`)?.parentElement;
              if (activeItem) {
                tocRef.current.scrollTop = (activeItem as HTMLElement).offsetTop - 100;
              }
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: "-80px 0px -80% 0px" }
    );
    
    // Track all section elements
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

  return (
    <div className="min-h-screen bg-beige-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div 
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="text-coffee-600" />
            <h1 className="text-3xl font-bold text-coffee-800">Documentation</h1>
          </div>
          
          <motion.div 
            className="prose prose-coffee max-w-none mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="text-lg text-coffee-700">
              Welcome to the ThinkV documentation. Here you'll find all the information you need to set up your IoT monitoring platform, connect devices, and visualize your data.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar with documentation navigation */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="lg:sticky lg:top-24">
                <Card className="overflow-hidden mb-6">
                  <div className="p-4 border-b border-beige-200">
                    <h2 className="font-medium text-coffee-800">Table of Contents</h2>
                  </div>

                  <div className="max-h-[70vh] overflow-y-auto" ref={tocRef}>
                    <ul className="divide-y divide-beige-200">
                      {docSections.map((section) => (
                        <li key={section.id}>
                          <a
                            href={`#${section.id}`}
                            className={`flex items-center px-4 py-3 hover:bg-beige-100 transition-colors ${
                              activeSection === section.id ? 'bg-beige-100 border-l-4 border-coffee-600 text-coffee-800 font-medium' : 'text-coffee-600'
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                          >
                            {section.icon}
                            {section.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>

                <Card className="overflow-hidden">
                  <div className="p-4 border-b border-beige-200">
                    <h2 className="font-medium text-coffee-800">Need Help?</h2>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-coffee-600 mb-4">
                      If you can't find what you're looking for in our documentation, our support team is ready to help.
                    </p>
                    <div className="space-y-2">
                      <Link to="/api-docs">
                        <Button 
                          variant="outline" 
                          size="sm"
                          leftIcon={<FileJson size={16} />}
                          className="w-full"
                        >
                          API Documentation
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        leftIcon={<ExternalLink size={16} />}
                        className="w-full"
                      >
                        Contact Support
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>

            {/* Main content - Documentation */}
            <motion.div 
              className="lg:col-span-9"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <div className="prose prose-coffee max-w-none">
                  {/* Introduction Section */}
                  <section id="introduction" ref={(el) => (sectionRefs.current['introduction'] = el)}>
                    <h2 className="flex items-center">
                      <BookOpen size={20} className="mr-2 text-coffee-600" />
                      Introduction
                    </h2>
                    <p>
                      ThinkV is a powerful IoT data visualization platform that makes it easy to collect, analyze, 
                      and visualize data from your connected devices. Whether you're monitoring environmental 
                      conditions, tracking energy usage, or collecting any kind of sensor data, ThinkV provides
                      the tools you need to gain insights from your IoT ecosystem.
                    </p>
                    
                    <h3>Key Features</h3>
                    <ul>
                      <li><strong>Easy Device Integration</strong> - Connect almost any IoT device using our simple REST API</li>
                      <li><strong>Real-time Dashboards</strong> - Visualize your data with customizable charts and statistics</li>
                      <li><strong>Data Storage</strong> - Securely store your time-series data for long-term analysis</li>
                      <li><strong>Device Management</strong> - Easily manage multiple devices and data sources</li>
                      <li><strong>API Access</strong> - Programmatically access your data and integrate with other services</li>
                      <li><strong>Multi-user Access</strong> - Share dashboards and collaborate with team members</li>
                    </ul>
                    
                    <h3>Platform Architecture</h3>
                    <p>
                      ThinkV uses a channel-based architecture, where each channel represents a device or collection 
                      of related data sources. Channels contain fields, which represent individual data points 
                      (like temperature, humidity, etc.). This flexible structure allows you to organize your 
                      IoT data in a way that makes sense for your specific use case.
                    </p>
                    
                    <div className="bg-beige-100 p-4 rounded-md border border-beige-200 mb-4">
                      <h4 className="font-medium text-coffee-800">Platform Overview</h4>
                      <ul className="list-disc list-inside mt-2">
                        <li><strong>Channels</strong> - Represent devices or collections of data sources</li>
                        <li><strong>Fields</strong> - Individual data points within a channel (e.g., temperature, humidity)</li>
                        <li><strong>API</strong> - RESTful interface for sending and retrieving data</li>
                        <li><strong>Dashboards</strong> - Customizable visualizations of your data</li>
                      </ul>
                    </div>
                  </section>
                  
                  {/* Getting Started Section */}
                  <section id="getting-started" className="mt-10" ref={(el) => (sectionRefs.current['getting-started'] = el)}>
                    <h2 className="flex items-center">
                      <Zap size={20} className="mr-2 text-coffee-600" />
                      Getting Started
                    </h2>
                    <p>
                      This section will guide you through the process of setting up your ThinkV account and 
                      creating your first channel to start collecting and visualizing data.
                    </p>
                    
                    <h3>Create Your Account</h3>
                    <ol>
                      <li>Visit the ThinkV homepage and click "Sign Up"</li>
                      <li>Enter your email address and create a password</li>
                      <li>Verify your email address by clicking the link in the verification email</li>
                      <li>Complete your profile information</li>
                    </ol>
                    
                    <h3>Create Your First Channel</h3>
                    <ol>
                      <li>From your dashboard, click the "New Channel" button</li>
                      <li>Enter a name and description for your channel</li>
                      <li>Add fields to your channel that represent the data you want to collect (e.g., temperature, humidity)</li>
                      <li>Save your channel to generate an API key</li>
                    </ol>
                    
                    <h3>Send Data to Your Channel</h3>
                    <p>
                      Once you've created a channel, you can start sending data to it using the ThinkV API. 
                      Here's a simple example using cURL:
                    </p>
                    
                    <div className="bg-coffee-800 text-beige-100 p-4 rounded-md overflow-x-auto">
                      <pre className="text-sm">
{`# Replace YOUR_CHANNEL_ID and YOUR_API_KEY with your actual values
curl -X POST "https://api.dwoscloud.shop/api/v1/channels/YOUR_CHANNEL_ID/update" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -d '{
    "field1": 23.5,
    "field2": 45.2
  }'`}
                      </pre>
                    </div>
                    
                    <p className="mt-4">
                      You can also use our device simulator to generate test data without needing to set up a physical device.
                    </p>
                    
                    <h3>View Your Data</h3>
                    <p>
                      After sending data to your channel, you can view it on your dashboard. The dashboard 
                      automatically creates visualizations for each field in your channel.
                    </p>
                    
                    <div className="flex justify-center my-6">
                      <Button
                        leftIcon={<ArrowRight size={16} />}
                        className="bg-coffee-600 hover:bg-coffee-700"
                      >
                        Create Your First Channel
                      </Button>
                    </div>
                  </section>
                  
                  {/* Channels Section */}
                  <section id="channels" className="mt-10" ref={(el) => (sectionRefs.current['channels'] = el)}>
                    <h2 className="flex items-center">
                      <Cloud size={20} className="mr-2 text-coffee-600" />
                      Channels
                    </h2>
                    <p>
                      Channels are the fundamental organizational unit in ThinkV. A channel represents a device or collection 
                      of related data sources, with each channel containing multiple fields.
                    </p>
                    
                    <h3>Channel Structure</h3>
                    <p>
                      Each channel contains the following components:
                    </p>
                    <ul>
                      <li><strong>Channel Name</strong> - A descriptive name for your channel</li>
                      <li><strong>Description</strong> - Optional details about what the channel represents</li>
                      <li><strong>API Key</strong> - A unique key used to authenticate when sending data to the channel</li>
                      <li><strong>Fields</strong> - Individual data points collected in the channel (e.g., temperature, humidity)</li>
                      <li><strong>Tags</strong> - Optional labels to help organize and filter your channels</li>
                      <li><strong>Privacy Settings</strong> - Control who can view and access your channel data</li>
                    </ul>
                    
                    <h3>Creating a Channel</h3>
                    <p>
                      To create a new channel:
                    </p>
                    <ol>
                      <li>From your dashboard, click the "New Channel" button</li>
                      <li>Enter a name and description for your channel</li>
                      <li>Add fields to your channel by specifying:
                        <ul>
                          <li>Field name (e.g., "Temperature")</li>
                          <li>Unit (e.g., "°C")</li>
                          <li>Color for visualization</li>
                        </ul>
                      </li>
                      <li>Optionally add tags to categorize your channel</li>
                      <li>Save your channel to generate an API key</li>
                    </ol>
                    
                    <h3>Fields</h3>
                    <p>
                      Fields represent individual measurements or data points within a channel. Each field has:
                    </p>
                    <ul>
                      <li><strong>Name</strong> - A descriptive name for the data point</li>
                      <li><strong>Unit</strong> - Optional unit of measurement (e.g., °C, %, rpm)</li>
                      <li><strong>Color</strong> - Used in visualizations to distinguish between fields</li>
                    </ul>
                    
                    <h3>API Keys</h3>
                    <p>
                      Each channel has a unique API key that must be included with requests that modify or access that channel's data.
                      Keep your API keys secure and never expose them in client-side code.
                    </p>
                    
                    <div className="bg-beige-100 p-4 rounded-md border border-beige-200 mb-4">
                      <h4 className="font-medium text-coffee-800 flex items-center">
                        <Lightbulb size={16} className="mr-2 text-coffee-600" />
                        Best Practices
                      </h4>
                      <ul className="list-disc list-inside mt-2 text-coffee-600">
                        <li>Create separate channels for unrelated devices or data sources</li>
                        <li>Use descriptive names and tags to keep your channels organized</li>
                        <li>Regularly back up your API keys</li>
                        <li>Regenerate API keys periodically for enhanced security</li>
                      </ul>
                    </div>
                  </section>
                  
                  {/* Dashboard Section */}
                  <section id="dashboard" className="mt-10" ref={(el) => (sectionRefs.current['dashboard'] = el)}>
                    <h2 className="flex items-center">
                      <PanelTop size={20} className="mr-2 text-coffee-600" />
                      Dashboard
                    </h2>
                    <p>
                      The dashboard is your central control panel for viewing and managing your IoT data.
                    </p>
                    
                    <h3>Dashboard Layout</h3>
                    <p>
                      The main dashboard consists of the following components:
                    </p>
                    <ul>
                      <li><strong>Channel List</strong> - A sidebar showing all your available channels</li>
                      <li><strong>Data Visualization</strong> - Charts and graphs showing your channel data</li>
                      <li><strong>Statistics Panel</strong> - Key metrics and statistics about your data</li>
                      <li><strong>Time Range Selector</strong> - Controls for adjusting the time period displayed</li>
                    </ul>
                    
                    <h3>Navigating the Dashboard</h3>
                    <p>
                      To view data for a specific channel:
                    </p>
                    <ol>
                      <li>Select the channel from the sidebar</li>
                      <li>The main visualization will update to show data for the selected channel</li>
                      <li>Use the time range selector to adjust the period displayed</li>
                      <li>Hover over data points to see detailed information</li>
                    </ol>
                    
                    <h3>Dashboard Actions</h3>
                    <p>
                      From the dashboard, you can perform several actions:
                    </p>
                    <ul>
                      <li><strong>Refresh Data</strong> - Update the display with the latest data</li>
                      <li><strong>Export Data</strong> - Download your data in CSV or JSON format</li>
                      <li><strong>Share Dashboard</strong> - Generate links to share with others</li>
                      <li><strong>Create New Channel</strong> - Add a new data source to your account</li>
                    </ul>
                    
                    <h3>Mobile Dashboard</h3>
                    <p>
                      The ThinkV dashboard is fully responsive and works on mobile devices. The mobile 
                      interface provides the same functionality as the desktop version, with a layout 
                      optimized for smaller screens.
                    </p>
                  </section>
                  
                  {/* Charts & Visualization Section */}
                  <section id="charts" className="mt-10" ref={(el) => (sectionRefs.current['charts'] = el)}>
                    <h2 className="flex items-center">
                      <BarChart2 size={20} className="mr-2 text-coffee-600" />
                      Charts & Visualization
                    </h2>
                    <p>
                      ThinkV provides powerful data visualization tools to help you understand and analyze your IoT data.
                    </p>
                    
                    <h3>Chart Types</h3>
                    <p>
                      ThinkV supports several types of visualizations:
                    </p>
                    <ul>
                      <li><strong>Line Charts</strong> - Ideal for time-series data showing trends over time</li>
                      <li><strong>Bar Charts</strong> - Useful for comparing values across categories</li>
                      <li><strong>Gauge Charts</strong> - Show current values relative to thresholds</li>
                      <li><strong>Numeric Displays</strong> - Simple display of current values and statistics</li>
                    </ul>
                    
                    <h3>Time Range Selection</h3>
                    <p>
                      You can adjust the time range displayed in your charts using the time range selector:
                    </p>
                    <ul>
                      <li><strong>1h</strong> - Last hour of data</li>
                      <li><strong>6h</strong> - Last 6 hours</li>
                      <li><strong>24h</strong> - Last 24 hours</li>
                      <li><strong>7d</strong> - Last 7 days</li>
                      <li><strong>30d</strong> - Last 30 days</li>
                      <li><strong>90d</strong> - Last 90 days</li>
                    </ul>
                    
                    <h3>Interacting with Charts</h3>
                    <p>
                      ThinkV charts are interactive and provide several ways to explore your data:
                    </p>
                    <ul>
                      <li><strong>Hover</strong> - See detailed information about specific data points</li>
                      <li><strong>Zoom</strong> - Focus on a specific time period by dragging to select a range</li>
                      <li><strong>Pan</strong> - Navigate through your data by clicking and dragging</li>
                      <li><strong>Toggle Fields</strong> - Show or hide individual fields by clicking on the legend</li>
                    </ul>
                    
                    <h3>Chart Settings</h3>
                    <p>
                      You can customize your charts with various settings:
                    </p>
                    <ul>
                      <li><strong>Color</strong> - Change the color assigned to each field</li>
                      <li><strong>Units</strong> - Specify units for proper labeling</li>
                      <li><strong>Aggregation</strong> - Choose how data is aggregated (avg, min, max, sum)</li>
                      <li><strong>Scale</strong> - Set linear or logarithmic scale as needed</li>
                    </ul>
                    
                    <h3>Statistics Panel</h3>
                    <p>
                      The statistics panel provides key metrics for each field:
                    </p>
                    <ul>
                      <li><strong>Current Value</strong> - The most recent reading</li>
                      <li><strong>Average</strong> - Average value over the selected time period</li>
                      <li><strong>Minimum</strong> - Lowest value in the selected time period</li>
                      <li><strong>Maximum</strong> - Highest value in the selected time period</li>
                    </ul>
                  </section>
                  
                  {/* Device Integration Section */}
                  <section id="devices" className="mt-10" ref={(el) => (sectionRefs.current['devices'] = el)}>
                    <h2 className="flex items-center">
                      <Cpu size={20} className="mr-2 text-coffee-600" />
                      Device Integration
                    </h2>
                    <p>
                      ThinkV supports integration with a wide variety of IoT devices and platforms.
                    </p>
                    
                    <h3>Integration Methods</h3>
                    <p>
                      There are several ways to connect your devices to ThinkV:
                    </p>
                    <ul>
                      <li><strong>Direct API Integration</strong> - Devices with internet connectivity can send data directly to the ThinkV API</li>
                      <li><strong>Gateway Integration</strong> - Connect devices via a local gateway or hub</li>
                      <li><strong>MQTT Bridge</strong> - Forward data from MQTT brokers to ThinkV</li>
                      <li><strong>ThinkV Libraries</strong> - Use our client libraries for popular platforms</li>
                    </ul>
                    
                    <h3>Supported Hardware</h3>
                    <p>
                      ThinkV works with a wide range of hardware platforms, including:
                    </p>
                    <ul>
                      <li><strong>Arduino</strong> - Using WiFi or Ethernet shields</li>
                      <li><strong>ESP8266/ESP32</strong> - Direct integration via WiFi</li>
                      <li><strong>Raspberry Pi</strong> - Using Python, Node.js, or other languages</li>
                      <li><strong>Particle Devices</strong> - Photon, Electron, etc.</li>
                      <li><strong>Custom Hardware</strong> - Any device capable of making HTTP requests</li>
                    </ul>
                    
                    <h3>Data Formats</h3>
                    <p>
                      ThinkV accepts data in the following formats:
                    </p>
                    <ul>
                      <li><strong>JSON</strong> - For devices that can create JSON payloads</li>
                      <li><strong>URL Parameters</strong> - For simpler devices with limited capabilities</li>
                    </ul>
                    
                    <div className="bg-coffee-800 text-beige-100 p-4 rounded-md overflow-x-auto mb-4">
                      <pre className="text-sm">
{`// Example JSON format
{
  "field1": 23.5,
  "field2": 45.2
}

// Example URL parameter format
/update?api_key=YOUR_API_KEY&field1=23.5&field2=45.2`}
                      </pre>
                    </div>
                    
                    <h3>Connection Reliability</h3>
                    <p>
                      To ensure reliable data collection, consider implementing the following features in your device code:
                    </p>
                    <ul>
                      <li><strong>Retry Logic</strong> - Automatically retry failed connections</li>
                      <li><strong>Local Buffering</strong> - Store data locally when connection is unavailable</li>
                      <li><strong>Batch Updates</strong> - Send multiple data points in a single request to reduce overhead</li>
                      <li><strong>Error Handling</strong> - Properly handle API errors and network issues</li>
                    </ul>
                    
                    <div className="bg-beige-100 p-4 rounded-md border border-beige-200 mb-4">
                      <h4 className="font-medium text-coffee-800 flex items-center">
                        <Lightbulb size={16} className="mr-2 text-coffee-600" />
                        Device Integration Best Practices
                      </h4>
                      <ul className="list-disc list-inside mt-2 text-coffee-600">
                        <li>Choose an appropriate update interval for your application (balance between data resolution and battery life)</li>
                        <li>Implement error handling and retry logic for reliable operation</li>
                        <li>Include unique device identifiers in your data for easier tracking</li>
                        <li>Consider data usage and battery impact for portable devices</li>
                      </ul>
                    </div>
                  </section>
                  
                  {/* API Overview Section */}
                  <section id="api" className="mt-10" ref={(el) => (sectionRefs.current['api'] = el)}>
                    <h2 className="flex items-center">
                      <FileJson size={20} className="mr-2 text-coffee-600" />
                      API Overview
                    </h2>
                    <p>
                      ThinkV provides a comprehensive REST API for sending data, retrieving historical values, 
                      managing channels, and more. This section provides a high-level overview of the API.
                      For detailed documentation, visit the <Link to="/api-docs" className="text-coffee-600 hover:text-coffee-800 underline">API Documentation</Link> page.
                    </p>
                    
                    <h3>Key API Endpoints</h3>
                    <ul>
                      <li><strong>Update Channel Data</strong> - Send new data points to your channel</li>
                      <li><strong>Get Field Data</strong> - Retrieve historical data for a specific field</li>
                      <li><strong>Get Channel Information</strong> - Retrieve metadata about a channel</li>
                      <li><strong>Create Channel</strong> - Programmatically create new channels</li>
                    </ul>
                    
                    <h3>Authentication</h3>
                    <p>
                      The ThinkV API uses API keys for authentication. Each channel has its own unique API key.
                      You can include your API key in requests using either:
                    </p>
                    <ul>
                      <li><strong>HTTP Header</strong> - <code>X-API-Key: YOUR_API_KEY</code></li>
                      <li><strong>Query Parameter</strong> - <code>?api_key=YOUR_API_KEY</code></li>
                    </ul>
                    
                    <h3>Data Formats</h3>
                    <p>
                      The API accepts and returns data in JSON format. For specific endpoint details, 
                      request/response formats, and example code, refer to the full API documentation.
                    </p>
                    
                    <div className="flex justify-center my-6">
                      <Link to="/api-docs">
                        <Button
                          leftIcon={<FileJson size={16} />}
                          className="bg-coffee-600 hover:bg-coffee-700"
                        >
                          View Full API Documentation
                        </Button>
                      </Link>
                    </div>
                  </section>
                  
                  {/* Device Simulator Section */}
                  <section id="simulator" className="mt-10" ref={(el) => (sectionRefs.current['simulator'] = el)}>
                    <h2 className="flex items-center">
                      <Smartphone size={20} className="mr-2 text-coffee-600" />
                      Device Simulator
                    </h2>
                    <p>
                      The ThinkV Device Simulator allows you to generate test data without needing to set up physical hardware.
                      This is useful for testing your visualizations, developing applications, or demonstrations.
                    </p>
                    
                    <h3>Using the Simulator</h3>
                    <ol>
                      <li>Navigate to the Simulator page from the main menu</li>
                      <li>Select the channel you want to simulate</li>
                      <li>Configure the simulator settings:
                        <ul>
                          <li><strong>Update Interval</strong> - How frequently to send data (in milliseconds)</li>
                          <li><strong>Value Variation</strong> - How much the values should change between updates</li>
                        </ul>
                      </li>
                      <li>Click "Start Simulation" to begin sending data</li>
                      <li>Monitor the data logs to see the values being sent and API responses</li>
                    </ol>
                    
                    <h3>Simulator Features</h3>
                    <ul>
                      <li><strong>Realistic Data Generation</strong> - Values change gradually to simulate real-world sensors</li>
                      <li><strong>Real API Integration</strong> - Uses the actual ThinkV API for authentic testing</li>
                      <li><strong>Detailed Logs</strong> - See the exact data being sent and received</li>
                      <li><strong>Customizable Parameters</strong> - Adjust settings to match your use case</li>
                    </ul>
                    
                    <div className="bg-beige-100 p-4 rounded-md border border-beige-200 mb-4">
                      <h4 className="font-medium text-coffee-800 flex items-center">
                        <Lightbulb size={16} className="mr-2 text-coffee-600" />
                        Simulator Tips
                      </h4>
                      <ul className="list-disc list-inside mt-2 text-coffee-600">
                        <li>Use the simulator to test your dashboards and visualizations before deploying hardware</li>
                        <li>Try different update intervals to see how they affect your visualizations</li>
                        <li>Generate test data to develop and debug your applications</li>
                        <li>Use the simulator for demonstrations and presentations</li>
                      </ul>
                    </div>
                    
                    <div className="flex justify-center my-6">
                      <Link to="/simulator">
                        <Button
                          leftIcon={<Smartphone size={16} />}
                          className="bg-coffee-600 hover:bg-coffee-700"
                        >
                          Open Device Simulator
                        </Button>
                      </Link>
                    </div>
                  </section>
                  
                  {/* Account Settings Section */}
                  <section id="settings" className="mt-10" ref={(el) => (sectionRefs.current['settings'] = el)}>
                    <h2 className="flex items-center">
                      <Settings size={20} className="mr-2 text-coffee-600" />
                      Account Settings
                    </h2>
                    <p>
                      Manage your ThinkV account settings, user profile, and preferences.
                    </p>
                    
                    <h3>Profile Settings</h3>
                    <p>
                      You can update your profile information from the Profile page:
                    </p>
                    <ul>
                      <li><strong>Name</strong> - Update your display name</li>
                      <li><strong>Profile Photo</strong> - Add or change your profile picture</li>
                      <li><strong>Bio</strong> - Add a short description about yourself</li>
                    </ul>
                    
                    <h3>Account Settings</h3>
                    <p>
                      Manage your account settings from the Settings page:
                    </p>
                    <ul>
                      <li><strong>Email</strong> - Update your email address (requires verification)</li>
                      <li><strong>Password</strong> - Change your account password</li>
                      <li><strong>Two-Factor Authentication</strong> - Enable for enhanced security</li>
                      <li><strong>Account Deletion</strong> - Permanently delete your account</li>
                    </ul>
                    
                    <h3>Notification Settings</h3>
                    <p>
                      Control how and when you receive notifications:
                    </p>
                    <ul>
                      <li><strong>Email Notifications</strong> - Receive updates via email</li>
                      <li><strong>Push Notifications</strong> - Receive alerts on your devices</li>
                      <li><strong>Product Updates</strong> - Stay informed about new features</li>
                      <li><strong>Marketing Emails</strong> - Promotional content and offers</li>
                    </ul>
                    
                    <h3>Appearance Settings</h3>
                    <p>
                      Customize the ThinkV interface to your preferences:
                    </p>
                    <ul>
                      <li><strong>Dark Mode</strong> - Enable a dark theme for low-light environments</li>
                      <li><strong>Compact View</strong> - Display more content with a condensed layout</li>
                      <li><strong>Chart Preferences</strong> - Set default chart types and colors</li>
                    </ul>
                    
                    <h3>Privacy Settings</h3>
                    <p>
                      Control who can see your information and data:
                    </p>
                    <ul>
                      <li><strong>Public Profile</strong> - Make your profile visible to other users</li>
                      <li><strong>Show Activity</strong> - Display your recent activity to others</li>
                      <li><strong>Show Channels</strong> - Make your channels visible on your public profile</li>
                    </ul>
                    
                    <div className="flex justify-center my-6">
                      <Link to="/settings">
                        <Button
                          leftIcon={<Settings size={16} />}
                          className="bg-coffee-600 hover:bg-coffee-700"
                        >
                          Manage Account Settings
                        </Button>
                      </Link>
                    </div>
                  </section>
                  
                  {/* FAQs Section */}
                  <section id="faqs" className="mt-10" ref={(el) => (sectionRefs.current['faqs'] = el)}>
                    <h2 className="flex items-center">
                      <HelpCircle size={20} className="mr-2 text-coffee-600" />
                      Frequently Asked Questions
                    </h2>
                    <p>
                      Find answers to common questions about ThinkV and IoT data visualization.
                    </p>
                    
                    <FaqItem 
                      question="How many devices can I connect to ThinkV?"
                      answer="ThinkV supports an unlimited number of devices. Each device typically corresponds to a channel in your account, and you can create as many channels as you need."
                    />
                    
                    <FaqItem 
                      question="What types of IoT devices work with ThinkV?"
                      answer="ThinkV works with any device that can make HTTP requests. This includes popular platforms like Arduino, ESP8266/ESP32, Raspberry Pi, and commercial IoT devices. If your device can connect to the internet and send HTTP requests, it can work with ThinkV."
                    />
                    
                    <FaqItem 
                      question="How often can I send data to ThinkV?"
                      answer="ThinkV supports a wide range of update frequencies, from seconds to days. For standard accounts, the minimum interval between updates is 1 second. If you need higher frequencies, contact us about enterprise options."
                    />
                    
                    <FaqItem 
                      question="How long is my data stored?"
                      answer="ThinkV stores your data indefinitely by default. You can access historical data going back to when you first started collecting it. Enterprise accounts can configure custom data retention policies if needed."
                    />
                    
                    <FaqItem 
                      question="Can I export my data from ThinkV?"
                      answer="Yes, you can export your data in CSV or JSON format. This can be done from the dashboard using the Export button, or programmatically using the API."
                    />
                    
                    <FaqItem 
                      question="Is there a limit to how much data I can store?"
                      answer="Free accounts include 10MB of data storage. Paid accounts have higher limits based on your subscription tier. If you need additional storage, you can upgrade your account or contact us for custom options."
                    />
                    
                    <FaqItem 
                      question="Can I share my dashboards with others?"
                      answer="Yes, you can generate share links for your dashboards. These links can be set to require a password, be publicly accessible, or restricted to specific email addresses."
                    />
                    
                    <FaqItem 
                      question="Does ThinkV work with MQTT?"
                      answer="While ThinkV doesn't natively support MQTT, you can use an MQTT bridge or gateway to forward data from your MQTT broker to the ThinkV API."
                    />
                    
                    <FaqItem 
                      question="How secure is my data in ThinkV?"
                      answer="ThinkV uses industry-standard security practices, including encryption for data in transit and at rest, API key authentication, and regular security audits. Your data is isolated from other users, and you have full control over who can access it."
                    />
                    
                    <FaqItem 
                      question="Can I use ThinkV with my existing IoT platform?"
                      answer="Yes, ThinkV can be integrated with most existing IoT platforms through the API. You can send data from your current platform to ThinkV for enhanced visualization, or use ThinkV alongside your existing solution."
                    />
                  </section>
                </div>
              </Card>
            </motion.div>
          </div>
          
          <motion.div
            className="mt-10 bg-beige-50 border border-beige-200 rounded-lg p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <h2 className="text-xl font-semibold text-coffee-800 mb-4">Need more help?</h2>
            <p className="text-coffee-600 mb-6">
              Our community forum and support team are always here to help with questions, issues, or feedback about ThinkV.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                leftIcon={<ExternalLink size={16} />}
                className="bg-coffee-600 hover:bg-coffee-700"
              >
                Visit support forums
              </Button>
              <Button
                variant="outline"
              >
                Contact us
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

// FAQ Item Component
interface FaqItemProps {
  question: string;
  answer: string;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-beige-200 last:border-b-0 py-3">
      <button
        className="flex justify-between items-center w-full text-left font-medium text-coffee-800 hover:text-coffee-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight size={18} className="text-coffee-500" />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="mt-2 mb-1 text-coffee-600 pr-6">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Documentation;