/*
  # Fix infinite recursion in database policies - Fixed version
  
  1. Policy Cleanup
    - First drop policies that depend on the materialized view
    - Then drop the materialized view
    - Recreate policies with simple, non-recursive definitions
  
  2. Security
    - Maintain same access control with cleaner implementation
*/

-- First drop the policies that depend on the materialized view
DROP POLICY IF EXISTS "channels_access" ON channels;
DROP POLICY IF EXISTS "datapoints_access" ON datapoints;

-- Now that the dependencies are removed, we can drop the materialized view
DROP MATERIALIZED VIEW IF EXISTS channel_access;

-- Drop all functions and their dependencies
DROP FUNCTION IF EXISTS check_channel_access(uuid) CASCADE;
DROP FUNCTION IF EXISTS check_channel_modify(uuid) CASCADE;
DROP FUNCTION IF EXISTS check_channel_insert_permission(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_user_channels_direct(uuid) CASCADE;
DROP FUNCTION IF EXISTS refresh_channel_access() CASCADE;

-- Temporarily disable RLS
ALTER TABLE channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE datapoints DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
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

-- Re-enable RLS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE datapoints ENABLE ROW LEVEL SECURITY;

-- Create simplified channel policies without materialized views
CREATE POLICY "channels_select"
  ON channels
  FOR SELECT
  USING (
    is_public = true OR
    user_id = auth.uid() OR
    id IN (
      SELECT channel_id 
      FROM channel_members 
      WHERE user_id = auth.uid()
    )
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

-- Create simplified datapoint policies
CREATE POLICY "datapoints_select"
  ON datapoints
  FOR SELECT
  USING (
    channel_id IN (
      SELECT id FROM channels
      WHERE is_public = true OR
            user_id = auth.uid() OR
            id IN (SELECT channel_id FROM channel_members WHERE user_id = auth.uid())
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

-- Create simplified function to get user's channels
CREATE OR REPLACE FUNCTION get_user_channels_direct(user_id_param UUID)
RETURNS SETOF channels
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT DISTINCT c.*
    FROM channels c
    LEFT JOIN channel_members cm ON c.id = cm.channel_id
    WHERE c.is_public = true
       OR c.user_id = user_id_param
       OR cm.user_id = user_id_param
    ORDER BY c.created_at DESC;
$$;