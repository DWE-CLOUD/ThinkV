import { supabase } from '../utils/supabase';
import { Channel, DataPoint } from '../types';

// API Middleware for IoT Platform
export const api = {
  /**
   * Update channel data with values sent from IoT devices
   */
  async updateChannelData(channelId: string, apiKey: string, data: Record<string, number>): Promise<any> {
    try {
      console.log(`Updating channel ${channelId} with data:`, data);
      
      // Verify channel exists and API key is valid
      const { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id, api_key, fields')
        .eq('id', channelId)
        .single();
      
      if (channelError || !channel) {
        console.error('Channel not found:', channelError);
        throw new Error('Channel not found');
      }
      
      if (channel.api_key !== apiKey) {
        console.error('Invalid API key');
        throw new Error('Invalid API key');
      }
      
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
        if (isNaN(fieldNumber) || fieldNumber < 1 || fieldNumber > channel.fields.length) continue;
        
        const fieldId = channel.fields[fieldNumber - 1].id;
        
        // Create a data point
        dataPoints.push({
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
          console.error('Error inserting data points:', insertError);
          throw new Error(`Error inserting data points: ${insertError.message}`);
        }
      }
      
      return {
        success: true,
        channel_id: channelId,
        timestamp,
        entry_id: Math.floor(Math.random() * 1000000),
        points_added: dataPoints.length
      };
    } catch (error) {
      console.error('Error updating channel data:', error);
      throw error;
    }
  },

  /**
   * Get channel data
   */
  async getChannelData(channelId: string): Promise<Channel | null> {
    try {
      // Get channel data
      const { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('*')
        .eq('id', channelId)
        .single();
      
      if (channelError) {
        console.error('Error getting channel:', channelError);
        return null;
      }
      
      return channel as unknown as Channel;
    } catch (error) {
      console.error('Error getting channel data:', error);
      return null;
    }
  },

  /**
   * Get field data
   */
  async getFieldData(channelId: string, fieldId: string, limit: number = 100): Promise<DataPoint[]> {
    try {
      // Find the field in the channel's fields array
      const { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('fields')
        .eq('id', channelId)
        .single();
        
      if (channelError) {
        console.error('Error getting channel for field data:', channelError);
        return [];
      }
      
      let actualFieldId = fieldId;
      
      // If fieldId is a number (like "1"), convert it to the actual field id from the fields array
      if (/^\d+$/.test(fieldId)) {
        const fieldIndex = parseInt(fieldId) - 1;
        if (fieldIndex >= 0 && fieldIndex < channel.fields.length) {
          actualFieldId = channel.fields[fieldIndex].id;
        } else {
          console.error(`Field index ${fieldIndex} out of bounds`);
          return [];
        }
      }
      
      // Get data points for the specified field
      const { data: dataPoints, error: dataError } = await supabase
        .from('datapoints')
        .select('*')
        .eq('channel_id', channelId)
        .eq('field_id', actualFieldId)
        .order('timestamp', { ascending: false })
        .limit(limit);
      
      if (dataError) {
        console.error('Error getting field data:', dataError);
        return [];
      }
      
      return dataPoints as unknown as DataPoint[];
    } catch (error) {
      console.error('Error getting field data:', error);
      return [];
    }
  }
};