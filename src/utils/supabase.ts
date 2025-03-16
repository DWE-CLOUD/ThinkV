import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { Channel, User, DataPoint } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Helper function to get current session
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
};

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
};

// Function to generate a new API key
export const generateApiKey = (): string => {
  return `thinkv_${uuidv4().replace(/-/g, '')}`;
};

// Function to check if string is a valid UUID
const isValidUuid = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// Convert database object to Channel model
export const dbToChannel = (item: any): Channel => {
  // Handle fields column specially to account for potential schema differences
  let fields = [];
  try {
    if (item.fields) {
      // If fields is a string, parse it
      if (typeof item.fields === 'string') {
        fields = JSON.parse(item.fields);
      } 
      // If it's already an array or object, use it directly
      else if (Array.isArray(item.fields) || typeof item.fields === 'object') {
        fields = Array.isArray(item.fields) ? item.fields : [];
      }
    }
  } catch (e) {
    console.error("Error parsing fields:", e);
    fields = [];
  }

  return {
    id: item.id,
    name: item.name,
    description: item.description || '',
    userId: item.user_id,
    isPublic: item.is_public ?? true,
    tags: item.tags || [],
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    apiKey: item.api_key,
    fields: fields
  };
};

// Convert Channel model to database object
export const channelToDb = (channel: Partial<Channel>): any => {
  const dbObj: any = {};
  
  if (channel.name !== undefined) dbObj.name = channel.name;
  if (channel.description !== undefined) dbObj.description = channel.description;
  if (channel.userId !== undefined) dbObj.user_id = channel.userId;
  if (channel.isPublic !== undefined) dbObj.is_public = channel.isPublic;
  if (channel.tags !== undefined) dbObj.tags = channel.tags;
  if (channel.fields !== undefined) dbObj.fields = channel.fields;
  if (channel.apiKey !== undefined) dbObj.api_key = channel.apiKey;
  
  return dbObj;
};

// Convert database object to DataPoint model
export const dbToDataPoint = (item: any): DataPoint => {
  return {
    id: item.id,
    channelId: item.channel_id,
    fieldId: item.field_id,
    value: item.value,
    timestamp: item.timestamp
  };
};

// Function to regenerate API key for a channel
export const regenerateApiKey = async (channelId: string): Promise<{ apiKey: string, error?: Error }> => {
  const newApiKey = generateApiKey();
  
  try {
    // Convert numeric ID to UUID if necessary (for mock data)
    const dbChannelId = isValidUuid(channelId) ? channelId : uuidv4();
    
    const { data, error } = await supabase
      .from('channels')
      .update({ api_key: newApiKey, updated_at: new Date().toISOString() })
      .eq('id', dbChannelId)
      .select('api_key')
      .single();
    
    if (error) {
      throw error;
    }
    
    return { apiKey: data?.api_key || newApiKey };
  } catch (error) {
    console.error('Error regenerating API key:', error);
    return { apiKey: newApiKey, error: error as Error };
  }
};

// Function to create a channel
export const createChannel = async (channel: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>) => {
  // Ensure channel has an API key
  const apiKey = channel.apiKey || generateApiKey();
  
  try {
    // Convert to database format
    const dbChannel = channelToDb(channel);
    dbChannel.api_key = apiKey;
    
    const { data, error } = await supabase
      .from('channels')
      .insert([dbChannel])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Convert from DB format to our application format
    const createdChannel = dbToChannel(data);
    
    return { channel: createdChannel, error: null };
  } catch (error) {
    console.error('Error creating channel:', error);
    return { channel: null, error };
  }
};

// Function to get channel by ID
export const getChannelById = async (channelId: string) => {
  try {
    // Convert numeric ID to UUID if necessary (for mock data)
    const dbChannelId = isValidUuid(channelId) ? channelId : uuidv4();
    
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('id', dbChannelId)
      .single();
    
    if (error) {
      throw error;
    }
    
    // Convert from DB format to our application format
    const channel = dbToChannel(data);
    
    return { channel, error: null };
  } catch (error) {
    console.error('Error fetching channel:', error);
    return { channel: null, error };
  }
};

// Function to fetch user's channels
export const getUserChannels = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    // Convert from DB format to our application format
    const channels: Channel[] = data.map(dbToChannel);
    
    return { channels, error: null };
  } catch (error) {
    console.error('Error fetching user channels:', error);
    return { channels: [], error };
  }
};

// Function to update a channel
export const updateChannel = async (channelId: string, updates: Partial<Channel>) => {
  try {
    // Convert numeric ID to UUID if necessary (for mock data)
    const dbChannelId = isValidUuid(channelId) ? channelId : uuidv4();
    
    // Convert updates to database format
    const dbUpdates = channelToDb(updates);
    
    // Add updated timestamp
    dbUpdates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('channels')
      .update(dbUpdates)
      .eq('id', dbChannelId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    // Convert from DB format to our application format
    const updatedChannel = dbToChannel(data);
    
    return { channel: updatedChannel, error: null };
  } catch (error) {
    console.error('Error updating channel:', error);
    return { channel: null, error };
  }
};

// Function to delete a channel
export const deleteChannel = async (channelId: string) => {
  try {
    // Convert numeric ID to UUID if necessary (for mock data)
    const dbChannelId = isValidUuid(channelId) ? channelId : uuidv4();
    
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', dbChannelId);
    
    if (error) {
      throw error;
    }
    
    return { error: null };
  } catch (error) {
    console.error('Error deleting channel:', error);
    return { error };
  }
};

// Function to fetch data points for a channel
export const getDataPoints = async (channelId: string, timeRange?: string) => {
  try {
    // For mock data with numeric IDs, we'll fall back to mock data service
    if (!isValidUuid(channelId)) {
      console.warn('Using mock data for non-UUID channel ID:', channelId);
      // Return empty array to allow fallback to mock data
      return { dataPoints: [], error: new Error('Not a valid UUID') };
    }
    
    let query = supabase
      .from('datapoints')
      .select('*')
      .eq('channel_id', channelId)
      .order('timestamp', { ascending: true });
    
    // Add time range filter if provided
    if (timeRange) {
      let hoursBack = 24;
      
      switch (timeRange) {
        case '1h': hoursBack = 1; break;
        case '6h': hoursBack = 6; break;
        case '24h': hoursBack = 24; break;
        case '7d': hoursBack = 24 * 7; break;
        case '30d': hoursBack = 24 * 30; break;
        case '90d': hoursBack = 24 * 90; break;
      }
      
      const fromDate = new Date();
      fromDate.setHours(fromDate.getHours() - hoursBack);
      
      query = query.gte('timestamp', fromDate.toISOString());
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Convert from DB format to our application format
    const dataPoints: DataPoint[] = data.map(dbToDataPoint);
    
    return { dataPoints, error: null };
  } catch (error) {
    console.error('Error fetching data points:', error);
    return { dataPoints: [], error };
  }
};

// Function to insert a data point
export const insertDataPoint = async (dataPoint: Omit<DataPoint, 'id'>) => {
  try {
    // For mock data with numeric IDs, we'll fall back to mock data service
    if (!isValidUuid(dataPoint.channelId)) {
      console.warn('Using mock service for non-UUID channel ID:', dataPoint.channelId);
      return { dataPoint: null, error: new Error('Not a valid UUID') };
    }
    
    const { data, error } = await supabase
      .from('datapoints')
      .insert([{
        channel_id: dataPoint.channelId,
        field_id: dataPoint.fieldId,
        value: dataPoint.value,
        timestamp: dataPoint.timestamp
      }])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return { dataPoint: dbToDataPoint(data), error: null };
  } catch (error) {
    console.error('Error inserting data point:', error);
    return { dataPoint: null, error };
  }
};

// Function to update user profile
export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: updates.name,
        avatar_url: updates.avatar,
        bio: updates.bio
      }
    });
    
    if (error) {
      throw error;
    }
    
    return { error: null };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { error };
  }
};

export { isValidUuid }