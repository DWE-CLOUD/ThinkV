/*
  # Complete Reset and Fix for Database Policies
  
  1. Policy Overhaul
    - Temporarily disable RLS to ensure clean slate
    - Drop ALL existing policies to eliminate any recursion
    - Create completely new, well-named policies with proper references
  
  2. Application Access Patterns
    - Public channel access 
    - Owner access to their own channels
    - Member access via channel_members table
    - Insert/update/delete permissions
    - API key access for device data
*/

-- First, disable RLS to allow clean policy deletion
ALTER TABLE channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE datapoints DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies by name
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
DROP POLICY IF EXISTS "channels_public_select" ON channels;
DROP POLICY IF EXISTS "channels_owner_select" ON channels;
DROP POLICY IF EXISTS "channels_member_select" ON channels;
DROP POLICY IF EXISTS "channels_insert" ON channels;
DROP POLICY IF EXISTS "channels_update" ON channels;
DROP POLICY IF EXISTS "channels_delete" ON channels;

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
DROP POLICY IF EXISTS "datapoints_public_select" ON datapoints;
DROP POLICY IF EXISTS "datapoints_owner_select" ON datapoints;
DROP POLICY IF EXISTS "datapoints_member_select" ON datapoints;
DROP POLICY IF EXISTS "datapoints_insert" ON datapoints;
DROP POLICY IF EXISTS "datapoints_api_insert" ON datapoints;
DROP POLICY IF EXISTS "datapoints_update" ON datapoints;
DROP POLICY IF EXISTS "datapoints_delete" ON datapoints;

-- Re-enable RLS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE datapoints ENABLE ROW LEVEL SECURITY;

-- CHANNEL POLICIES
-- 1. View public channels
CREATE POLICY "ch_public_view" 
  ON channels
  FOR SELECT
  USING (is_public = true);

-- 2. View own channels
CREATE POLICY "ch_owner_view" 
  ON channels
  FOR SELECT
  USING (user_id = auth.uid());

-- 3. View channels as member
CREATE POLICY "ch_member_view" 
  ON channels
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = id 
      AND channel_members.user_id = auth.uid()
    )
  );

-- 4. Insert own channels
CREATE POLICY "ch_owner_insert" 
  ON channels
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 5. Update own channels
CREATE POLICY "ch_owner_update" 
  ON channels
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 6. Delete own channels
CREATE POLICY "ch_owner_delete" 
  ON channels
  FOR DELETE
  USING (user_id = auth.uid());

-- DATAPOINT POLICIES
-- 1. View datapoints from public channels
CREATE POLICY "dp_public_view" 
  ON datapoints
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = channel_id
      AND channels.is_public = true
    )
  );

-- 2. View datapoints from own channels
CREATE POLICY "dp_owner_view" 
  ON datapoints
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = channel_id
      AND channels.user_id = auth.uid()
    )
  );

-- 3. View datapoints from channels as member
CREATE POLICY "dp_member_view" 
  ON datapoints
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = channel_id
      AND channel_members.user_id = auth.uid()
    )
  );

-- 4. Insert datapoints to own channels
CREATE POLICY "dp_owner_insert" 
  ON datapoints
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = channel_id
      AND channels.user_id = auth.uid()
    )
  );

-- 5. Insert datapoints with API key
CREATE POLICY "dp_api_insert" 
  ON datapoints
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = channel_id
      AND channels.api_key = current_setting('request.headers')::json->>'x-api-key'
    )
  );

-- 6. Update datapoints in own channels
CREATE POLICY "dp_owner_update" 
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

-- 7. Delete datapoints from own channels
CREATE POLICY "dp_owner_delete" 
  ON datapoints
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = channel_id
      AND channels.user_id = auth.uid()
    )
  );