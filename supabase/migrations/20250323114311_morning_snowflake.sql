-- Drop all functions and their dependencies
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

-- Create simplified channel policies - NO RECURSION
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
    id IN (
      SELECT channel_id 
      FROM channel_members 
      WHERE user_id = auth.uid()
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

-- Create simplified datapoint policies - NO RECURSION
CREATE POLICY "datapoint_select_public"
  ON datapoints
  FOR SELECT
  USING (
    channel_id IN (
      SELECT id 
      FROM channels 
      WHERE is_public = true
    )
  );

CREATE POLICY "datapoint_select_owner"
  ON datapoints
  FOR SELECT
  USING (
    channel_id IN (
      SELECT id 
      FROM channels 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "datapoint_select_member"
  ON datapoints
  FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id 
      FROM channel_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "datapoint_insert_owner"
  ON datapoints
  FOR INSERT
  WITH CHECK (
    channel_id IN (
      SELECT id 
      FROM channels 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "datapoint_insert_api"
  ON datapoints
  FOR INSERT
  WITH CHECK (
    channel_id IN (
      SELECT id 
      FROM channels 
      WHERE api_key = COALESCE(current_setting('request.headers', true)::json->>'x-api-key', '')
    )
  );

CREATE POLICY "datapoint_update_owner"
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

CREATE POLICY "datapoint_delete_owner"
  ON datapoints
  FOR DELETE
  USING (
    channel_id IN (
      SELECT id 
      FROM channels 
      WHERE user_id = auth.uid()
    )
  );

-- Create view for accessing channels without RLS (for admin purposes)
CREATE OR REPLACE VIEW channels_norls AS 
SELECT * FROM channels;

-- Create function to check if user has access to a channel
CREATE OR REPLACE FUNCTION check_channel_access(p_channel_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM channels
    WHERE id = p_channel_id
    AND (
      is_public = true OR
      user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM channel_members
        WHERE channel_id = p_channel_id
        AND user_id = auth.uid()
      )
    )
  );
END;
$$;

-- Create function to check if user can modify a channel
CREATE OR REPLACE FUNCTION check_channel_modify(p_channel_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM channels
    WHERE id = p_channel_id
    AND user_id = auth.uid()
  );
END;
$$;

-- Create function to check insert permission
CREATE OR REPLACE FUNCTION check_channel_insert_permission(p_channel_id UUID) 
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN 
    -- Owner can insert
    EXISTS (
      SELECT 1 FROM channels
      WHERE id = p_channel_id
      AND user_id = auth.uid()
    )
    OR
    -- API key can insert
    EXISTS (
      SELECT 1 FROM channels
      WHERE id = p_channel_id
      AND api_key = COALESCE(current_setting('request.headers', true)::json->>'x-api-key', '')
    );
END;
$$;