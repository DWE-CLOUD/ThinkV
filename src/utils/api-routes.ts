import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import { Channel, DataPoint } from '../types';

// Define the API route handlers for IoT data platform

/**
 * Updates channel data with values sent from IoT devices
 * @route POST /api/v1/channels/:channelId/update
 */
export async function updateChannelData(channelId: string, apiKey: string, data: Record<string, number>): Promise<any> {
  try {
    // Verify channel exists and API key is valid
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('id, api_key, fields')
      .eq('id', channelId)
      .single();
    
    if (channelError || !channel) {
      throw new Error('Channel not found');
    }
    
    if (channel.api_key !== apiKey) {
      throw new Error('Invalid API key');
    }
    
    // Check if the fields in the data exist in the channel
    const fields = channel.fields || [];
    
    // Current timestamp
    const timestamp = new Date().toISOString();
    
    // Prepare data points for insertion
    const dataPoints: Partial<DataPoint>[] = [];
    
    // Process each field in the incoming data
    for (const [key, value] of Object.entries(data)) {
      // Check if the key is in the format "field1", "field2", etc.
      const fieldMatch = key.match(/^field(\d+)$/);
      if (!fieldMatch) continue;
      
      const fieldNumber = parseInt(fieldMatch[1]);
      if (isNaN(fieldNumber) || fieldNumber < 1 || fieldNumber > fields.length) continue;
      
      const fieldId = fields[fieldNumber - 1].id;
      
      // Create a data point
      dataPoints.push({
        id: uuidv4(),
        channelId,
        fieldId,
        value,
        timestamp
      });
    }
    
    // Insert data points
    if (dataPoints.length > 0) {
      const { error: insertError } = await supabase
        .from('datapoints')
        .insert(dataPoints);
      
      if (insertError) {
        throw new Error(`Error inserting data points: ${insertError.message}`);
      }
    }
    
    return {
      success: true,
      channel_id: channelId,
      timestamp,
      entry_id: uuidv4().substring(0, 8),
      points_added: dataPoints.length
    };
  } catch (error) {
    console.error('Error updating channel data:', error);
    throw error;
  }
}

/**
 * Get channel data
 * @route GET /api/v1/channels/:channelId
 */
export async function getChannelData(channelId: string, userId: string): Promise<Channel> {
  try {
    // Verify channel exists and belongs to the user
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('*')
      .eq('id', channelId)
      .eq('user_id', userId)
      .single();
    
    if (channelError || !channel) {
      throw new Error('Channel not found or access denied');
    }
    
    return channel as unknown as Channel;
  } catch (error) {
    console.error('Error getting channel data:', error);
    throw error;
  }
}

/**
 * Get field data
 * @route GET /api/v1/channels/:channelId/fields/:fieldId
 */
export async function getFieldData(
  channelId: string, 
  fieldId: string, 
  userId: string,
  limit: number = 100
): Promise<DataPoint[]> {
  try {
    // Verify channel exists and belongs to the user
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('id, user_id')
      .eq('id', channelId)
      .eq('user_id', userId)
      .single();
    
    if (channelError || !channel) {
      throw new Error('Channel not found or access denied');
    }
    
    // Get data points for the specified field
    const { data: dataPoints, error: dataError } = await supabase
      .from('datapoints')
      .select('*')
      .eq('channel_id', channelId)
      .eq('field_id', fieldId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (dataError) {
      throw new Error(`Error getting field data: ${dataError.message}`);
    }
    
    return dataPoints as unknown as DataPoint[];
  } catch (error) {
    console.error('Error getting field data:', error);
    throw error;
  }
}

/**
 * Set up API routes in the frontend
 * This function would normally be part of a server implementation
 * but for this example we'll handle it in the frontend
 */
export function setupApiRoutes() {
  // This is just a placeholder function since we're not
  // actually setting up routes in the frontend
  console.log('API routes set up');
}