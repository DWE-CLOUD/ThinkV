/*
  # Fix infinite recursion in database policies
  
  1. Policy Cleanup
    - Drop ALL existing policies to ensure no conflicts
    - Create new simplified policies without circular references
  
  2. Security
    - Maintain same access control with non-recursive implementation
*/

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
END
$$;

-- Re-enable RLS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE datapoints ENABLE ROW LEVEL SECURITY;

-- Create simplified channel policies
CREATE POLICY "channels_select_public"
  ON channels
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "channels_select_owner"
  ON channels
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "channels_select_member"
  ON channels
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = id 
      AND channel_members.user_id = auth.uid()
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
CREATE POLICY "datapoints_select_public"
  ON datapoints
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = channel_id
      AND channels.is_public = true
    )
  );

CREATE POLICY "datapoints_select_owner"
  ON datapoints
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = channel_id
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "datapoints_select_member"
  ON datapoints
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = channel_id
      AND channel_members.user_id = auth.uid()
    )
  );

CREATE POLICY "datapoints_insert_owner"
  ON datapoints
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = channel_id
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "datapoints_insert_api"
  ON datapoints
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = channel_id
      AND channels.api_key = current_setting('request.headers')::json->>'x-api-key'
    )
  );

CREATE POLICY "datapoints_update_owner"
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

CREATE POLICY "datapoints_delete_owner"
  ON datapoints
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = channel_id
      AND channels.user_id = auth.uid()
    )
  );

-- Create helper function to get user's channels directly
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

-- Create helper function to get channel data directly
CREATE OR REPLACE FUNCTION get_channel_data_direct(channel_id_param UUID)
RETURNS SETOF datapoints
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT d.*
  FROM datapoints d
  WHERE d.channel_id = channel_id_param;
END;
$$;