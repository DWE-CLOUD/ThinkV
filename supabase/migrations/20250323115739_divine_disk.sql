-- Drop all functions and their dependencies first
DROP FUNCTION IF EXISTS check_channel_access(uuid) CASCADE;
DROP FUNCTION IF EXISTS check_channel_modify(uuid) CASCADE;
DROP FUNCTION IF EXISTS check_channel_insert_permission(uuid) CASCADE;

-- Temporarily disable RLS
ALTER TABLE channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE datapoints DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "channel_select_public" ON channels;
    DROP POLICY IF EXISTS "channel_select_owner" ON channels;
    DROP POLICY IF EXISTS "channel_select_member" ON channels;
    DROP POLICY IF EXISTS "channel_insert" ON channels;
    DROP POLICY IF EXISTS "channel_update" ON channels;
    DROP POLICY IF EXISTS "channel_delete" ON channels;
    DROP POLICY IF EXISTS "datapoint_select_public" ON datapoints;
    DROP POLICY IF EXISTS "datapoint_select_owner" ON datapoints;
    DROP POLICY IF EXISTS "datapoint_select_member" ON datapoints;
    DROP POLICY IF EXISTS "datapoint_insert_owner" ON datapoints;
    DROP POLICY IF EXISTS "datapoint_insert_api" ON datapoints;
    DROP POLICY IF EXISTS "datapoint_update_owner" ON datapoints;
    DROP POLICY IF EXISTS "datapoint_delete_owner" ON datapoints;
END $$;

-- Re-enable RLS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE datapoints ENABLE ROW LEVEL SECURITY;

-- Create simplified channel policies with direct conditions
CREATE POLICY "channel_select_public"
  ON channels
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "channel_select_owner"
  ON channels
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "channel_select_member"
  ON channels
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = id 
      AND channel_members.user_id = auth.uid()
    )
  );

CREATE POLICY "channel_insert"
  ON channels
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "channel_update"
  ON channels
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "channel_delete"
  ON channels
  FOR DELETE
  USING (user_id = auth.uid());

-- Create simplified datapoint policies with direct conditions
CREATE POLICY "datapoint_select_public"
  ON datapoints
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = datapoints.channel_id
      AND channels.is_public = true
    )
  );

CREATE POLICY "datapoint_select_owner"
  ON datapoints
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = datapoints.channel_id
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "datapoint_select_member"
  ON datapoints
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = datapoints.channel_id
      AND channel_members.user_id = auth.uid()
    )
  );

CREATE POLICY "datapoint_insert_owner"
  ON datapoints
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = datapoints.channel_id
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "datapoint_insert_api"
  ON datapoints
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = datapoints.channel_id
      AND channels.api_key = COALESCE(current_setting('request.headers', true)::json->>'x-api-key', '')
    )
  );

CREATE POLICY "datapoint_update_owner"
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

CREATE POLICY "datapoint_delete_owner"
  ON datapoints
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = datapoints.channel_id
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
DECLARE
  result_record channels%ROWTYPE;
BEGIN
  FOR result_record IN
    SELECT DISTINCT c.*
    FROM channels c
    WHERE c.user_id = user_id_param
       OR c.is_public = true
       OR EXISTS (
          SELECT 1 
          FROM channel_members cm
          WHERE cm.channel_id = c.id 
          AND cm.user_id = user_id_param
       )
    ORDER BY c.created_at DESC
  LOOP
    RETURN NEXT result_record;
  END LOOP;
  RETURN;
END;
$$;