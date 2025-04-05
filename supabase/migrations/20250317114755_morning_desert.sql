/*
  # Fix infinite recursion in channel policies

  1. Policy Updates
    - Fix recursive policies for channels and datapoints
    - Rewrite with proper references to avoid circular dependencies
  
  2. Security
    - Maintain the same access controls without recursion errors
*/

-- Drop the problematic policies first
DROP POLICY IF EXISTS "Users can view channels they have access to" ON channels;
DROP POLICY IF EXISTS "Users can view datapoints of channels they have access to" ON datapoints;

-- Recreate the policies with fixes to prevent recursion

-- New policy for channels access, avoiding the recursion
CREATE POLICY "Users can view their channels"
  ON channels
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    is_public = true
  );

-- Create a separate policy for shared access
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

-- Fix for datapoints policy
CREATE POLICY "Users can view their channel datapoints" 
  ON datapoints 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM channels 
      WHERE channels.id = datapoints.channel_id 
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view shared channel datapoints" 
  ON datapoints 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM channels 
      WHERE channels.id = datapoints.channel_id 
      AND channels.is_public = true
    )
  );

CREATE POLICY "Users can view member datapoints" 
  ON datapoints 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = datapoints.channel_id
      AND channel_members.user_id = auth.uid()
    )
  );