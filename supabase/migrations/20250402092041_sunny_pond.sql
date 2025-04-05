/*
  # Remove Channel Sharing System
  
  1. Schema Changes
    - Drop policies that depend on channel_members first
    - Drop sharing-related tables with CASCADE to ensure dependent objects are removed
    - Create new simplified policies without member access
  
  2. Security
    - Maintain core functionality without sharing features
    - Update policies to remove member access
*/

-- Temporarily disable RLS to make changes easier
ALTER TABLE channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE datapoints DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to remove dependencies
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Drop all policies for channels
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'channels'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON channels', pol.policyname);
    END LOOP;
    
    -- Drop all policies for datapoints
    FOR pol IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'datapoints'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON datapoints', pol.policyname);
    END LOOP;
END $$;

-- Drop trigger and function related to sharing
DROP TRIGGER IF EXISTS validate_channel_share_trigger ON channel_shares CASCADE;
DROP FUNCTION IF EXISTS validate_channel_share() CASCADE;
DROP FUNCTION IF EXISTS refresh_channel_access() CASCADE;

-- Now drop the sharing-related tables using CASCADE
DROP TABLE IF EXISTS channel_invitations CASCADE;
DROP TABLE IF EXISTS channel_shares CASCADE;
DROP TABLE IF EXISTS channel_members CASCADE;

-- Re-enable RLS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE datapoints ENABLE ROW LEVEL SECURITY;

-- Create new simplified channel policies without member access
CREATE POLICY "channels_select"
  ON channels
  FOR SELECT
  USING (
    is_public = true OR
    user_id = auth.uid()
  );

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

-- Create new simplified datapoint policies without member access
CREATE POLICY "datapoints_select"
  ON datapoints
  FOR SELECT
  USING (
    channel_id IN (
      SELECT id FROM channels
      WHERE is_public = true OR
            user_id = auth.uid()
    )
  );

CREATE POLICY "datapoints_insert"
  ON datapoints
  FOR INSERT
  WITH CHECK (
    channel_id IN (
      SELECT id FROM channels WHERE user_id = auth.uid()
    ) OR
    channel_id IN (
      SELECT id FROM channels 
      WHERE api_key = COALESCE(current_setting('request.headers', true)::json->>'x-api-key', '')
    )
  );

CREATE POLICY "datapoints_update"
  ON datapoints
  FOR UPDATE
  USING (
    channel_id IN (
      SELECT id FROM channels WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    channel_id IN (
      SELECT id FROM channels WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "datapoints_delete"
  ON datapoints
  FOR DELETE
  USING (
    channel_id IN (
      SELECT id FROM channels WHERE user_id = auth.uid()
    )
  );

-- Update the function to get user's channels directly without member access
CREATE OR REPLACE FUNCTION get_user_channels_direct(user_id_param UUID)
RETURNS SETOF channels
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT DISTINCT c.*
    FROM channels c
    WHERE c.is_public = true
       OR c.user_id = user_id_param
    ORDER BY c.created_at DESC;
$$;