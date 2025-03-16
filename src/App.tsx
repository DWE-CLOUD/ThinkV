import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import DevicesPage from './pages/DevicesPage';
import ChannelDashboard from './pages/ChannelDashboard';
import ChannelDetails from './pages/ChannelDetails';
import ApiDocumentation from './pages/ApiDocumentation';
import SimulatorPage from './pages/SimulatorPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/devices" element={<DevicesPage />} />
          <Route path="/channels/:channelId" element={<ChannelDashboard />} />
          <Route path="/channels/:channelId/details" element={<ChannelDetails />} />
          <Route path="/api-docs" element={<ApiDocumentation />} />
          <Route path="/api-docs/:channelId" element={<ApiDocumentation />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route path="/simulator/:channelId" element={<SimulatorPage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;