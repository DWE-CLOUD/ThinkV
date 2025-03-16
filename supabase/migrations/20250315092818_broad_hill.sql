/*
  # Create schema for ThinkV application

  1. New Tables
    - `channels`: Stores IoT channels with their configuration
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `description` (text, optional)
      - `user_id` (uuid, foreign key to auth.users)
      - `is_public` (boolean, default true)
      - `tags` (text[], default empty array)
      - `fields` (jsonb, stores field definitions)
      - `api_key` (text, unique, for device authentication)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `datapoints`: Stores time-series data for channel fields
      - `id` (uuid, primary key)
      - `channel_id` (uuid, foreign key to channels)
      - `field_id` (text, identifies field within channel)
      - `value` (float, the actual data value)
      - `timestamp` (timestamp, when data was recorded)
      - `created_at` (timestamp, when data was stored)
  
  2. Security
    - Enable RLS on all tables
    - Add policies to control data access
*/

-- Create the channels table
CREATE TABLE IF NOT EXISTS channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  user_id uuid REFERENCES auth.users(id),
  is_public boolean DEFAULT true,
  tags text[] DEFAULT '{}',
  fields jsonb DEFAULT '[]',
  api_key text UNIQUE DEFAULT ('thinkv_' || replace(gen_random_uuid()::text, '-', '')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create the datapoints table for time-series data
CREATE TABLE IF NOT EXISTS datapoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  field_id text NOT NULL,
  value float NOT NULL,
  timestamp timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_datapoints_channel_id ON datapoints(channel_id);
CREATE INDEX IF NOT EXISTS idx_datapoints_timestamp ON datapoints(timestamp);
CREATE INDEX IF NOT EXISTS idx_datapoints_field_id ON datapoints(field_id);
CREATE INDEX IF NOT EXISTS idx_channels_user_id ON channels(user_id);
CREATE INDEX IF NOT EXISTS idx_channels_api_key ON channels(api_key);

-- Enable Row Level Security
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE datapoints ENABLE ROW LEVEL SECURITY;

-- Policies for channels table
CREATE POLICY "Users can view their own channels" 
  ON channels 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own channels" 
  ON channels 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own channels" 
  ON channels 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own channels" 
  ON channels 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Policies for datapoints table
CREATE POLICY "Users can view datapoints of their channels" 
  ON datapoints 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM channels 
    WHERE channels.id = datapoints.channel_id 
    AND channels.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert datapoints to their channels" 
  ON datapoints 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM channels 
    WHERE channels.id = datapoints.channel_id 
    AND channels.user_id = auth.uid()
  ));

CREATE POLICY "Users can update datapoints of their channels" 
  ON datapoints 
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM channels 
    WHERE channels.id = datapoints.channel_id 
    AND channels.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM channels 
    WHERE channels.id = datapoints.channel_id 
    AND channels.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete datapoints of their channels" 
  ON datapoints 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM channels 
    WHERE channels.id = datapoints.channel_id 
    AND channels.user_id = auth.uid()
  ));

-- Add API authentication policy to allow devices to insert data using API key
CREATE POLICY "API can insert data with valid key" 
  ON datapoints 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM channels 
    WHERE channels.id = datapoints.channel_id 
    AND channels.api_key = current_setting('request.headers')::json->>'x-api-key'
  ));

-- Create function to update the "updated_at" timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update "updated_at" on channels
CREATE TRIGGER update_channels_updated_at
BEFORE UPDATE ON channels
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();