/*
  # Reset and recreate non-recursive database policies

  1. Policy Updates
    - Drop ALL existing channel and datapoint policies to eliminate conflicts
    - Create clean, non-recursive policies with proper references
  
  2. Security
    - Maintain exact same access control with clear policy definitions
*/

-- First, drop ALL existing policies to ensure we have a clean slate
DROP POLICY IF EXISTS "Anyone can view public channels" ON channels;
DROP POLICY IF EXISTS "Users can view their own channels" ON channels;
DROP POLICY IF EXISTS "Users can view shared channels" ON channels;
DROP POLICY IF EXISTS "Public channels viewable by anyone" ON channels;
DROP POLICY IF EXISTS "Direct channel ownership access" ON channels;
DROP POLICY IF EXISTS "Channel member access" ON channels;
DROP POLICY IF EXISTS "Users can create their own channels" ON channels;
DROP POLICY IF EXISTS "Users can insert their own channels" ON channels;
DROP POLICY IF EXISTS "Users can update their own channels" ON channels;
DROP POLICY IF EXISTS "Users can delete their own channels" ON channels;

DROP POLICY IF EXISTS "Anyone can view data from public channels" ON datapoints;
DROP POLICY IF EXISTS "Users can view datapoints of their channels" ON datapoints;
DROP POLICY IF EXISTS "Users can view member datapoints" ON datapoints;
DROP POLICY IF EXISTS "Public channel data access" ON datapoints;
DROP POLICY IF EXISTS "Owner channel data access" ON datapoints;
DROP POLICY IF EXISTS "Member channel data access" ON datapoints;
DROP POLICY IF EXISTS "Users can insert datapoints to their channels" ON datapoints;
DROP POLICY IF EXISTS "Users can update datapoints of their channels" ON datapoints;
DROP POLICY IF EXISTS "Users can delete datapoints of their channels" ON datapoints;
DROP POLICY IF EXISTS "API can insert data with valid key" ON datapoints;

-- Create clean set of policies
-- Channel SELECT policies
CREATE POLICY "Public channels viewable by anyone" 
  ON channels
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view their own channels" 
  ON channels
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared channels" 
  ON channels
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = channels.id 
      AND channel_members.user_id = auth.uid()
    )
  );

-- Channel management policies
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

-- Datapoint SELECT policies
CREATE POLICY "Public channel data access" 
  ON datapoints
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = datapoints.channel_id
      AND channels.is_public = true
    )
  );

CREATE POLICY "Owner channel data access" 
  ON datapoints
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = datapoints.channel_id
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "Member channel data access" 
  ON datapoints
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = datapoints.channel_id
      AND channel_members.user_id = auth.uid()
    )
  );

-- Datapoint management policies
CREATE POLICY "Users can insert datapoints to their channels" 
  ON datapoints
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = datapoints.channel_id
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update datapoints of their channels" 
  ON datapoints
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = datapoints.channel_id
      AND channels.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = datapoints.channel_id
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete datapoints of their channels" 
  ON datapoints
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = datapoints.channel_id
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "API can insert data with valid key" 
  ON datapoints
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = datapoints.channel_id
      AND channels.api_key = current_setting('request.headers')::json->>'x-api-key'
    )
  );