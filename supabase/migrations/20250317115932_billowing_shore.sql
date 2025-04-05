/*
  # Reset and Fix Database Policies for Channels and Datapoints

  1. Policy Reset
    - Drop ALL existing policies to eliminate infinite recursion
    - Create completely new, simplified policies with clear references
  
  2. Security
    - Maintain same access control with proper, non-recursive policy definitions
    - Fix circular references that may be causing infinite recursion
*/

-- First, try to disable RLS temporarily to allow clean policy deletion
ALTER TABLE channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE datapoints DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies explicitly by name to ensure clean slate
DROP POLICY IF EXISTS "Anyone can view public channels" ON channels;
DROP POLICY IF EXISTS "Users can view their own channels" ON channels;
DROP POLICY IF EXISTS "Users can view shared channels" ON channels;
DROP POLICY IF EXISTS "Public channels viewable by anyone" ON channels;
DROP POLICY IF EXISTS "Users can view channels they have access to" ON channels;
DROP POLICY IF EXISTS "Direct channel ownership access" ON channels;
DROP POLICY IF EXISTS "Channel member access" ON channels;
DROP POLICY IF EXISTS "Users can create their own channels" ON channels;
DROP POLICY IF EXISTS "Users can insert their own channels" ON channels;
DROP POLICY IF EXISTS "Users can update their own channels" ON channels;
DROP POLICY IF EXISTS "Users can delete their own channels" ON channels;

DROP POLICY IF EXISTS "Anyone can view data from public channels" ON datapoints;
DROP POLICY IF EXISTS "Anyone can view public data" ON datapoints;
DROP POLICY IF EXISTS "Users can view datapoints of their channels" ON datapoints;
DROP POLICY IF EXISTS "Users can view datapoints of channels they have access to" ON datapoints;
DROP POLICY IF EXISTS "Users can view member datapoints" ON datapoints;
DROP POLICY IF EXISTS "Users can view their channel datapoints" ON datapoints;
DROP POLICY IF EXISTS "Users can view shared channel datapoints" ON datapoints;
DROP POLICY IF EXISTS "Public channel data access" ON datapoints;
DROP POLICY IF EXISTS "Owner channel data access" ON datapoints;
DROP POLICY IF EXISTS "Member channel data access" ON datapoints;
DROP POLICY IF EXISTS "Users can insert datapoints to their channels" ON datapoints;
DROP POLICY IF EXISTS "Users can update datapoints of their channels" ON datapoints;
DROP POLICY IF EXISTS "Users can delete datapoints of their channels" ON datapoints;
DROP POLICY IF EXISTS "API can insert data with valid key" ON datapoints;

-- Re-enable RLS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE datapoints ENABLE ROW LEVEL SECURITY;

-- Create new, simplified channel policies with clear, non-recursive references
-- 1. Public channels policy
CREATE POLICY "channels_public_select" 
  ON channels
  FOR SELECT
  USING (is_public = true);

-- 2. Own channels policy
CREATE POLICY "channels_owner_select" 
  ON channels
  FOR SELECT
  USING (user_id = auth.uid());

-- 3. Shared channels policy (simpler reference)
CREATE POLICY "channels_member_select" 
  ON channels
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = id 
      AND channel_members.user_id = auth.uid()
    )
  );

-- 4. Channel management policies
CREATE POLICY "channels_insert" 
  ON channels
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "channels_update" 
  ON channels
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "channels_delete" 
  ON channels
  FOR DELETE
  USING (user_id = auth.uid());

-- Create new datapoint policies with simplified references
-- 1. Public data policy
CREATE POLICY "datapoints_public_select" 
  ON datapoints
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = channel_id
      AND channels.is_public = true
    )
  );

-- 2. Own data policy
CREATE POLICY "datapoints_owner_select" 
  ON datapoints
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = channel_id
      AND channels.user_id = auth.uid()
    )
  );

-- 3. Member data policy
CREATE POLICY "datapoints_member_select" 
  ON datapoints
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = channel_id
      AND channel_members.user_id = auth.uid()
    )
  );

-- 4. Datapoint management policies
CREATE POLICY "datapoints_insert" 
  ON datapoints
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = channel_id
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "datapoints_api_insert" 
  ON datapoints
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = channel_id
      AND channels.api_key = current_setting('request.headers')::json->>'x-api-key'
    )
  );

CREATE POLICY "datapoints_update" 
  ON datapoints
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = channel_id
      AND channels.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = channel_id
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "datapoints_delete" 
  ON datapoints
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = channel_id
      AND channels.user_id = auth.uid()
    )
  );