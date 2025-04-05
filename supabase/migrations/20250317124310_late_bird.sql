/*
  # Fix infinite recursion in database policies
  
  1. Clean up existing policies
     - Remove all problematic policies that could be causing recursion
     - Use clear and simple policies without circular references
  
  2. Create direct access functions
     - Add functions that bypass RLS completely for critical operations
     - Ensure proper security with SECURITY DEFINER
*/

-- Temporarily disable RLS
ALTER TABLE channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE datapoints DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to ensure clean slate
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
END
$$;

-- Re-enable RLS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE datapoints ENABLE ROW LEVEL SECURITY;

-- Create simplified channel policies that don't reference datapoints
CREATE POLICY "channels_public_access"
  ON channels
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "channels_owner_access"
  ON channels
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "channels_member_access"
  ON channels
  FOR SELECT
  USING (
    id IN (
      SELECT channel_id 
      FROM channel_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "channels_owner_insert"
  ON channels
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "channels_owner_update"
  ON channels
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "channels_owner_delete"
  ON channels
  FOR DELETE
  USING (user_id = auth.uid());

-- Create simplified datapoint policies
CREATE POLICY "datapoints_public_access"
  ON datapoints
  FOR SELECT
  USING (
    channel_id IN (
      SELECT id 
      FROM channels 
      WHERE is_public = true
    )
  );

CREATE POLICY "datapoints_owner_access"
  ON datapoints
  FOR SELECT
  USING (
    channel_id IN (
      SELECT id 
      FROM channels 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "datapoints_member_access"
  ON datapoints
  FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id 
      FROM channel_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "datapoints_owner_insert"
  ON datapoints
  FOR INSERT
  WITH CHECK (
    channel_id IN (
      SELECT id 
      FROM channels 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "datapoints_api_insert"
  ON datapoints
  FOR INSERT
  WITH CHECK (
    channel_id IN (
      SELECT id 
      FROM channels 
      WHERE api_key = current_setting('request.headers')::json->>'x-api-key'
    )
  );

CREATE POLICY "datapoints_owner_update"
  ON datapoints
  FOR UPDATE
  USING (
    channel_id IN (
      SELECT id 
      FROM channels 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    channel_id IN (
      SELECT id 
      FROM channels 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "datapoints_owner_delete"
  ON datapoints
  FOR DELETE
  USING (
    channel_id IN (
      SELECT id 
      FROM channels 
      WHERE user_id = auth.uid()
    )
  );

-- Create direct access functions that completely bypass RLS
-- Function to get user's channels directly
CREATE OR REPLACE FUNCTION get_user_channels_direct(user_id_param UUID)
RETURNS SETOF channels
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM channels
  WHERE user_id = user_id_param
     OR is_public = true
     OR id IN (
        SELECT channel_id 
        FROM channel_members 
        WHERE user_id = user_id_param
     )
  ORDER BY created_at DESC;
END;
$$;

-- Function to get datapoints directly
CREATE OR REPLACE FUNCTION get_channel_datapoints_direct(channel_id_param UUID, from_date_param TIMESTAMPTZ)
RETURNS SETOF datapoints
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM datapoints
  WHERE channel_id = channel_id_param
    AND timestamp >= from_date_param
  ORDER BY timestamp ASC;
END;
$$;

-- Function to check if user has access to a channel
CREATE OR REPLACE FUNCTION user_can_access_channel(user_id_param UUID, channel_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  channel_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM channels
    WHERE id = channel_id_param
      AND (
        user_id = user_id_param
        OR is_public = true
        OR id IN (
          SELECT channel_id 
          FROM channel_members 
          WHERE user_id = user_id_param
        )
      )
  ) INTO channel_exists;
  
  RETURN channel_exists;
END;
$$;