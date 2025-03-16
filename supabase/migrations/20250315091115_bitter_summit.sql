/*
  # Create channels table and add API keys

  1. New Tables
    - `channels` table with all necessary columns
    - Includes API key column with proper constraints

  2. Security
    - Enable RLS on `channels` table
    - Add policy for users to update their own channel API keys
*/

-- Create the channels table if it doesn't exist
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  api_key TEXT DEFAULT 'thinkv_' || replace(gen_random_uuid()::text, '-', '')
);

-- Add index for faster API key lookups
CREATE INDEX IF NOT EXISTS idx_channels_api_key ON channels(api_key);

-- Enable row level security
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

-- Add policy to allow users to update their own channels
CREATE POLICY "Users can update their own channels" 
  ON channels 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add policy to allow users to select their own channels
CREATE POLICY "Users can view their own channels" 
  ON channels 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Add policy to allow users to insert their own channels
CREATE POLICY "Users can insert their own channels" 
  ON channels 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add policy to allow users to delete their own channels
CREATE POLICY "Users can delete their own channels" 
  ON channels 
  FOR DELETE 
  USING (auth.uid() = user_id);