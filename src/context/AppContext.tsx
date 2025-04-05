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
        }

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
        console.log('Auth state changed:', event);
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
      setError(null);
      
      try {
        const { channels: userChannels, error } = await getUserChannels(currentUser.id);
        
        if (error) {
          throw error;
        }
        
        if (userChannels && userChannels.length > 0) {
          setChannels(userChannels);
        } else {
          // If no channels exist, create mock channels in Supabase
          const mockPromises = mockChannels.map(channel => 
            createChannelApi({
              name: channel.name,
              description: channel.description,
              userId: currentUser.id,
              isPublic: channel.isPublic,
              tags: channel.tags,
              fields: channel.fields,
              apiKey: channel.apiKey || `thinkv_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
            })
          );
          
          const results = await Promise.all(mockPromises);
          const createdChannels = results
            .filter(result => result.channel !== null)
            .map(result => result.channel as Channel);
          
          setChannels(createdChannels);
        }
      } catch (error) {
        console.error('Error loading channels:', error);
        setError(`Failed to load channels: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      
      async function fetchChannelData() {
        try {
          const { dataPoints: fetchedDataPoints, error } = await getDataPoints(selectedChannel.id, selectedTimeRange);
          
          if (error) {
            throw error;
          }
          
          if (fetchedDataPoints && fetchedDataPoints.length > 0) {
            setDataPoints(fetchedDataPoints);
          } else {
            const mockData = getChannelData(selectedChannel.id, selectedTimeRange);
            setDataPoints(mockData);
          }
        } catch (error) {
          console.error('Error fetching channel data:', error);
          const mockData = getChannelData(selectedChannel.id, selectedTimeRange);
          setDataPoints(mockData);
        } finally {
          setIsLoading(false);
        }
      }

      setTimeout(() => {
        fetchChannelData();
      }, 600);
    }
  }, [selectedChannel, selectedTimeRange]);

  const refreshData = () => {
    if (selectedChannel) {
      setIsLoading(true);
      
      async function refreshChannelData() {
        try {
          const { dataPoints: fetchedDataPoints, error } = await getDataPoints(selectedChannel.id, selectedTimeRange);
          
          if (error) {
            throw error;
          }
          
          if (fetchedDataPoints && fetchedDataPoints.length > 0) {
            setDataPoints(fetchedDataPoints);
          } else {
            const mockData = getChannelData(selectedChannel.id, selectedTimeRange);
            setDataPoints(mockData);
          }
        } catch (error) {
          console.error('Error refreshing data:', error);
          const mockData = getChannelData(selectedChannel.id, selectedTimeRange);
          setDataPoints(mockData);
        } finally {
          setIsLoading(false);
        }
      }

      setTimeout(() => {
        refreshChannelData();
      }, 600);
    }
  };

  const createChannel = async (channel: Omit<Channel, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Channel | null> => {
    if (!currentUser) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Create channel using the IoT API first - Use the correct API endpoint
      const apiUrl = '/api/channels/api';
      
      // Generate a random delete secret
      const deleteSecret = Math.random().toString(36).substring(2, 15);
      
      // Map field names to the format expected by the API
      const fieldNames = channel.fields.map(field => field.name);
      
      // Prepare the payload for the API
      const apiPayload = {
        name: channel.name,
        description: channel.description || '',
        field_names: fieldNames,
        delete_secret: deleteSecret
      };
      
      console.log('Creating channel in API:', apiPayload);
      console.log('API URL:', apiUrl);
      
      // Send the request to create the channel in the IoT API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiPayload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
      }
      
      const apiResult = await response.json();
      console.log('API channel creation result:', apiResult);
      
      if (!apiResult.id) {
        throw new Error('API response missing channel ID');
      }
      
      // Fetch the channel details to get the API key
      const channelDetailsUrl = `/api/channels/${apiResult.id}`;
      const detailsResponse = await fetch(channelDetailsUrl);
      
      if (!detailsResponse.ok) {
        const errorText = await detailsResponse.text();
        throw new Error(`Failed to get channel details: ${errorText || detailsResponse.statusText}`);
      }
      
      const channelDetails = await detailsResponse.json();
      console.log('Channel details:', channelDetails);
      
      if (!channelDetails.api_key) {
        throw new Error('Channel details missing API key');
      }
      
      // Now create the channel in Supabase with the API channel ID
      const { channel: newChannel, error } = await createChannelApi({
        ...channel,
        userId: currentUser.id,
        apiKey: channelDetails.api_key,
        id: apiResult.id
      });
      
      if (error) {
        throw error;
      }
      
      if (newChannel) {
        setChannels(prev => [newChannel, ...prev]);
        setSelectedChannel(newChannel);
        return newChannel;
      }
      
      return null;
    } catch (error) {
      console.error('Error creating channel:', error);
      setError(`Failed to create channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateChannel = async (channelId: string, updates: Partial<Channel>): Promise<Channel | null> => {
    setIsLoading(true);
    try {
      const { channel: updatedChannel, error } = await updateChannelApi(channelId, updates);
      
      if (error) {
        throw error;
      }
      
      if (updatedChannel) {
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
      console.error('Error updating channel:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChannel = async (channelId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Delete from Supabase only
      const { error } = await deleteChannelApi(channelId);
      
      if (error) {
        throw error;
      }
      
      setChannels(prev => prev.filter(channel => channel.id !== channelId));
      
      if (selectedChannel?.id === channelId) {
        const remainingChannels = channels.filter(c => c.id !== channelId);
        setSelectedChannel(remainingChannels.length > 0 ? remainingChannels[0] : null);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting channel:', error);
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
      return Promise.resolve();
    } catch (error) {
      console.error('Error signing out:', error);
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;

    try {
      const { error } = await updateUserProfileApi(currentUser.id, updates);
      
      if (error) {
        throw error;
      }
      
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const regenerateChannelApiKey = async (channelId: string): Promise<string> => {
    try {
      // Try to regenerate API key with the external API first - Use the proxy configuration
      try {
        const apiUrl = `/api/channels/${channelId}/apikey`;
        const response = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          // You might need to add your auth token here if required by the API
        });
        
        if (response.ok) {
          const apiResult = await response.json();
          if (apiResult.api_key) {
            // Update in Supabase with the new key from the API
            const { error } = await supabase
              .from('channels')
              .update({ api_key: apiResult.api_key, updated_at: new Date().toISOString() })
              .eq('id', channelId);
            
            if (error) {
              console.error('Error updating API key in Supabase:', error);
            }
            
            // Update local state
            setChannels(prev => 
              prev.map(channel => 
                channel.id === channelId 
                  ? { ...channel, apiKey: apiResult.api_key, updatedAt: new Date().toISOString() } 
                  : channel
              )
            );
            
            if (selectedChannel?.id === channelId) {
              setSelectedChannel(prev => prev ? { ...prev, apiKey: apiResult.api_key, updatedAt: new Date().toISOString() } : null);
            }
            
            return apiResult.api_key;
          }
        } else {
          console.warn('Could not regenerate API key with the external API, falling back to Supabase');
        }
      } catch (apiError) {
        console.warn('Error regenerating API key with external API:', apiError);
      }
      
      // Fall back to Supabase regeneration
      const { apiKey, error } = await regenerateApiKey(channelId);
      
      if (error) {
        throw error;
      }
      
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
      console.error('Error regenerating API key:', error);
      throw error;
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