import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Channel, User, DataPoint, TimeRange } from '../types';
import { mockChannels, getChannelData } from '../data/mockData';
import { 
  supabase, 
  getCurrentSession, 
  getCurrentUser, 
  regenerateApiKey, 
  getUserChannels,
  createChannel as createChannelApi,
  updateChannel as updateChannelApi,
  deleteChannel as deleteChannelApi,
  getDataPoints,
  updateUserProfile as updateUserProfileApi,
  isValidUuid
} from '../utils/supabase';

// FastAPI backend URL
const FASTAPI_BASE_URL = 'http://82.25.104.223';

interface AppContextProps {
  currentUser: User | null;
  channels: Channel[];
  selectedChannel: Channel | null;
  selectedTimeRange: TimeRange;
  dataPoints: DataPoint[];
  isLoading: boolean;
  setSelectedChannel: (channel: Channel | null) => void;
  setSelectedTimeRange: (range: TimeRange) => void;
  refreshData: () => void;
  createChannel: (channel: Omit<Channel, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<Channel | null>;
  updateChannel: (channelId: string, updates: Partial<Channel>) => Promise<Channel | null>;
  deleteChannel: (channelId: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  authLoading: boolean;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  regenerateChannelApiKey: (channelId: string) => Promise<string>;
  error: string | null;
  setError: (error: string | null) => void;
  setDataPoints: React.Dispatch<React.SetStateAction<DataPoint[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('24h');
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize user session from Supabase
  useEffect(() => {
    async function loadUserSession() {
      setAuthLoading(true);
      try {
        // Check for existing session
        const { session, error: sessionError } = await getCurrentSession();
        
        if (sessionError) {
          console.error('Error fetching session:', sessionError);
          setAuthLoading(false);
          return;
        }
        
        if (session) {
          const { user, error: userError } = await getCurrentUser();
          
          if (userError) {
            console.error('Error fetching user:', userError);
            setAuthLoading(false);
            return;
          }
          
          if (user) {
            // Convert Supabase user to our User type
            setCurrentUser({
              id: user.id,
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              avatar: user.user_metadata?.avatar_url,
              bio: user.user_metadata?.bio || '',
            });
          }
        } else {
          // Fallback to mock user for development
          const mockUser = {
            id: 'mock-user-id',
            name: 'John Doe',
            email: 'john@example.com',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            bio: 'IoT enthusiast and developer. I love connecting devices and visualizing data.',
          };
          setCurrentUser(mockUser);
        }

        // Set auth loading to false after user is set
        setAuthLoading(false);
      } catch (error) {
        console.error('Error in auth flow:', error);
        setAuthLoading(false);
      }
    }

    loadUserSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setCurrentUser({
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            avatar: session.user.user_metadata?.avatar_url,
            bio: session.user.user_metadata?.bio || '',
          });
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setChannels([]);
          setSelectedChannel(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Load channels from Supabase when user is authenticated
  useEffect(() => {
    async function loadChannels() {
      if (!currentUser) return;
      
      setIsLoading(true);
      try {
        // Fetch channels from Supabase
        const { channels: userChannels, error } = await getUserChannels(currentUser.id);
        
        if (error) {
          console.error('Error fetching channels:', error);
          // Fall back to mock data if fetch fails
          const enhancedMockChannels = mockChannels.map(channel => ({
            ...channel,
            userId: currentUser.id,
            apiKey: channel.apiKey || `thinkv_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
          }));
          setChannels(enhancedMockChannels);
        } else if (userChannels && userChannels.length > 0) {
          setChannels(userChannels);
        } else {
          // If no channels are found, use mock data for initial experience
          // In real app, might start with empty state instead
          const enhancedMockChannels = mockChannels.map(channel => ({
            ...channel,
            userId: currentUser.id,
            apiKey: channel.apiKey || `thinkv_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
          }));
          
          // Save mock channels to database for persistence
          for (const channel of enhancedMockChannels) {
            await createChannelApi({
              name: channel.name,
              description: channel.description,
              userId: currentUser.id,
              isPublic: channel.isPublic,
              tags: channel.tags,
              fields: channel.fields,
              apiKey: channel.apiKey
            });
          }
          
          // Fetch again to get the persisted channels with proper IDs
          const { channels: savedChannels } = await getUserChannels(currentUser.id);
          if (savedChannels && savedChannels.length > 0) {
            setChannels(savedChannels);
          } else {
            setChannels(enhancedMockChannels);
          }
        }
      } catch (error) {
        console.error('Error loading channels:', error);
        // Fall back to mock data
        const enhancedMockChannels = mockChannels.map(channel => ({
          ...channel,
          userId: currentUser.id,
          apiKey: channel.apiKey || `thinkv_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
        }));
        setChannels(enhancedMockChannels);
      } finally {
        setIsLoading(false);
      }
    }

    loadChannels();
  }, [currentUser]);

  // Set the first channel as selected by default
  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0]);
    }
  }, [channels, selectedChannel]);

  // Load data when selected channel or time range changes
  useEffect(() => {
    if (selectedChannel) {
      setIsLoading(true);
      
      // First try to fetch data from Supabase
      async function fetchChannelData() {
        try {
          // For mock channels with numeric IDs, just use mock data directly
          if (!isValidUuid(selectedChannel.id)) {
            const mockData = getChannelData(selectedChannel.id, selectedTimeRange);
            setDataPoints(mockData);
            setIsLoading(false);
            return;
          }
          
          // Try to fetch real data from Supabase
          const { dataPoints: fetchedDataPoints, error } = await getDataPoints(selectedChannel.id, selectedTimeRange);
          
          if (error) {
            throw error;
          }
          
          if (fetchedDataPoints && fetchedDataPoints.length > 0) {
            setDataPoints(fetchedDataPoints);
          } else {
            // If no real data, fall back to mock data
            const mockData = getChannelData(selectedChannel.id, selectedTimeRange);
            setDataPoints(mockData);
          }
        } catch (error) {
          console.error('Error fetching channel data:', error);
          // Fall back to mock data
          const mockData = getChannelData(selectedChannel.id, selectedTimeRange);
          setDataPoints(mockData);
        } finally {
          setIsLoading(false);
        }
      }

      // For now, simulate with mock data with a delay for UX
      setTimeout(() => {
        fetchChannelData();
      }, 600);
    }
  }, [selectedChannel, selectedTimeRange]);

  const refreshData = () => {
    if (selectedChannel) {
      setIsLoading(true);
      
      // Try to fetch real data from Supabase first
      async function refreshChannelData() {
        try {
          // For mock channels with numeric IDs, just use mock data directly
          if (!isValidUuid(selectedChannel.id)) {
            const mockData = getChannelData(selectedChannel.id, selectedTimeRange);
            setDataPoints(mockData);
            setIsLoading(false);
            return;
          }
          
          const { dataPoints: fetchedDataPoints, error } = await getDataPoints(selectedChannel.id, selectedTimeRange);
          
          if (error) {
            throw error;
          }
          
          if (fetchedDataPoints && fetchedDataPoints.length > 0) {
            setDataPoints(fetchedDataPoints);
          } else {
            // If no real data, use mock data
            const mockData = getChannelData(selectedChannel.id, selectedTimeRange);
            setDataPoints(mockData);
          }
        } catch (error) {
          console.error('Error refreshing channel data:', error);
          // Fall back to mock data
          const mockData = getChannelData(selectedChannel.id, selectedTimeRange);
          setDataPoints(mockData);
        } finally {
          setIsLoading(false);
        }
      }

      // Simulate fetching with a delay
      setTimeout(() => {
        refreshChannelData();
      }, 600);
    }
  };

  const createChannel = async (channelData: Omit<Channel, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Channel | null> => {
    if (!currentUser) return null;
    
    setIsLoading(true);
    setError(null); // Clear any previous errors
    
    try {
      // First, register the channel with FastAPI backend
      const fieldNames = channelData.fields.map(field => field.name);

      // Create a channel on the FastAPI server
      console.log('Creating channel on FastAPI server...');
      try {
        const response = await fetch(`${FASTAPI_BASE_URL}/channels/api`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: channelData.name,
            description: channelData.description || '',
            field_names: fieldNames
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('FastAPI error:', errorText);
          setError(`Failed to create channel on API server: ${errorText}`);
          throw new Error(`FastAPI error: ${errorText}`);
        }

        const fastApiChannel = await response.json();
        console.log('Channel created on FastAPI:', fastApiChannel);

        // Use the ID and API key from FastAPI
        const apiKeyFromServer = fastApiChannel.api_key;
        const channelIdFromServer = fastApiChannel.id;

        console.log(`Using FastAPI channel ID: ${channelIdFromServer} and API key: ${apiKeyFromServer}`);

        // Now create in Supabase with the same ID and API key from FastAPI
        const { channel: newChannel, error } = await createChannelApi({
          ...channelData,
          id: channelIdFromServer, // Use the ID from FastAPI
          userId: currentUser.id,
          apiKey: apiKeyFromServer
        });
        
        if (error) {
          console.error('Error creating channel in Supabase:', error);
          // Fall back to using only the FastAPI channel info
          const fastApiConvertedChannel: Channel = {
            id: channelIdFromServer,
            name: fastApiChannel.name,
            description: fastApiChannel.description || '',
            userId: currentUser.id,
            isPublic: channelData.isPublic || true,
            tags: channelData.tags || [],
            createdAt: fastApiChannel.created_at,
            updatedAt: fastApiChannel.created_at,
            apiKey: apiKeyFromServer,
            fields: Object.entries(fastApiChannel.fields || {}).map(([fieldId, fieldData]: [string, any]) => ({
              id: fieldData.field_id.toString(),
              name: fieldData.name,
              fieldNumber: parseInt(fieldId),
              color: channelData.fields[parseInt(fieldId) - 1]?.color || '#c4a389',
              unit: channelData.fields[parseInt(fieldId) - 1]?.unit || ''
            }))
          };

          setChannels(prev => [...prev, fastApiConvertedChannel]);
          setSelectedChannel(fastApiConvertedChannel);
          return fastApiConvertedChannel;
        }
        
        if (newChannel) {
          // Make sure the channel has the right ID from FastAPI
          const finalChannel = {
            ...newChannel,
            id: channelIdFromServer // Ensure we're using the FastAPI channel ID
          };
          
          setChannels(prev => [...prev, finalChannel]);
          setSelectedChannel(finalChannel);
          return finalChannel;
        }
        
        return null;
      } catch (fastApiError) {
        console.error('Error with FastAPI channel creation:', fastApiError);
        setError(`Failed to create channel: ${fastApiError instanceof Error ? fastApiError.message : "Unknown error"}`);
        
        // No fallback to local creation - we need the FastAPI channel to work
        return null;
      }
    } catch (error) {
      console.error('Error in channel creation:', error);
      setError(`Failed to create channel: ${error instanceof Error ? error.message : "Unknown error"}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateChannel = async (channelId: string, updates: Partial<Channel>): Promise<Channel | null> => {
    setIsLoading(true);
    try {
      // Update in Supabase
      const { channel: updatedChannel, error } = await updateChannelApi(channelId, updates);
      
      if (error) {
        console.error('Error updating channel in Supabase:', error);
        
        // Fall back to local update only
        const updatedChannels = channels.map(channel => 
          channel.id === channelId 
            ? { ...channel, ...updates, updatedAt: new Date().toISOString() } 
            : channel
        );
        
        setChannels(updatedChannels);
        
        if (selectedChannel?.id === channelId) {
          const updatedSelectedChannel = { ...selectedChannel, ...updates, updatedAt: new Date().toISOString() };
          setSelectedChannel(updatedSelectedChannel);
          return updatedSelectedChannel;
        }
        
        return updatedChannels.find(c => c.id === channelId) || null;
      }
      
      if (updatedChannel) {
        // Update local state with data from Supabase
        setChannels(prev => prev.map(channel => 
          channel.id === channelId ? updatedChannel : channel
        ));
        
        if (selectedChannel?.id === channelId) {
          setSelectedChannel(updatedChannel);
        }
        
        return updatedChannel;
      }
      
      return null;
    } catch (error) {
      console.error('Error in channel update:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChannel = async (channelId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Delete from Supabase
      const { error } = await deleteChannelApi(channelId);
      
      if (error) {
        console.error('Error deleting channel from Supabase:', error);
        // Fall back to local deletion only
        setChannels(prev => prev.filter(channel => channel.id !== channelId));
        
        if (selectedChannel?.id === channelId) {
          // Set another channel as selected or null if none left
          const remainingChannels = channels.filter(c => c.id !== channelId);
          setSelectedChannel(remainingChannels.length > 0 ? remainingChannels[0] : null);
        }
        
        return true;
      }
      
      // Update local state
      setChannels(prev => prev.filter(channel => channel.id !== channelId));
      
      if (selectedChannel?.id === channelId) {
        // Set another channel as selected or null if none left
        const remainingChannels = channels.filter(c => c.id !== channelId);
        setSelectedChannel(remainingChannels.length > 0 ? remainingChannels[0] : null);
      }
      
      return true;
    } catch (error) {
      console.error('Error in channel deletion:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      setChannels([]);
      setSelectedChannel(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;

    try {
      // Update profile in Supabase
      const { error } = await updateUserProfileApi(currentUser.id, updates);
      
      if (error) {
        console.error('Error updating user profile in Supabase:', error);
      }
      
      // Update local state
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  // Add function to regenerate API key
  const regenerateChannelApiKey = async (channelId: string): Promise<string> => {
    try {
      // Regenerate via Supabase util function
      const { apiKey, error } = await regenerateApiKey(channelId);
      
      if (error) {
        console.error('Error regenerating API key:', error);
        // Fall back to local generation
        const newApiKey = `thinkv_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
        
        // Update local state with new API key
        setChannels(prev => 
          prev.map(channel => 
            channel.id === channelId 
              ? { ...channel, apiKey: newApiKey, updatedAt: new Date().toISOString() } 
              : channel
          )
        );
        
        if (selectedChannel?.id === channelId) {
          setSelectedChannel(prev => prev ? { ...prev, apiKey: newApiKey, updatedAt: new Date().toISOString() } : null);
        }
        
        return newApiKey;
      }
      
      // Update local state with new API key from Supabase
      setChannels(prev => 
        prev.map(channel => 
          channel.id === channelId 
            ? { ...channel, apiKey, updatedAt: new Date().toISOString() } 
            : channel
        )
      );
      
      if (selectedChannel?.id === channelId) {
        setSelectedChannel(prev => prev ? { ...prev, apiKey, updatedAt: new Date().toISOString() } : null);
      }
      
      return apiKey;
    } catch (error) {
      console.error('Error in API key regeneration:', error);
      // Fall back to local generation
      const newApiKey = `thinkv_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      
      // Update local state with new API key
      setChannels(prev => 
        prev.map(channel => 
          channel.id === channelId 
            ? { ...channel, apiKey: newApiKey, updatedAt: new Date().toISOString() } 
            : channel
        )
      );
      
      if (selectedChannel?.id === channelId) {
        setSelectedChannel(prev => prev ? { ...prev, apiKey: newApiKey, updatedAt: new Date().toISOString() } : null);
      }
      
      return newApiKey;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        channels,
        selectedChannel,
        selectedTimeRange,
        dataPoints,
        isLoading,
        setSelectedChannel,
        setSelectedTimeRange,
        refreshData,
        createChannel,
        updateChannel,
        deleteChannel,
        signOut,
        authLoading,
        updateUserProfile,
        regenerateChannelApiKey,
        error,
        setError,
        setDataPoints,
        setIsLoading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};