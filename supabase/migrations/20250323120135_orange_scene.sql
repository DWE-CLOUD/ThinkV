-- Drop all functions and their dependencies first
DROP FUNCTION IF EXISTS check_channel_access(uuid) CASCADE;
DROP FUNCTION IF EXISTS check_channel_modify(uuid) CASCADE;
DROP FUNCTION IF EXISTS check_channel_insert_permission(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_user_channels_direct(uuid) CASCADE;

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

-- Create basic channel policies without any joins or subqueries
CREATE POLICY "channel_view_public"
  ON channels
  FOR SELECT
  USING (is_public = true);

CREATE POLICY "channel_view_owner"
  ON channels
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "channel_view_member"
  ON channels
  FOR SELECT
  USING (
    id IN (
      SELECT channel_id 
      FROM channel_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "channel_insert_owner"
  ON channels
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "channel_update_owner"
  ON channels
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "channel_delete_owner"
  ON channels
  FOR DELETE
  USING (user_id = auth.uid());

-- Create basic datapoint policies without complex joins
CREATE POLICY "datapoint_view_public"
  ON datapoints
  FOR SELECT
  USING (
    channel_id IN (
      SELECT id 
      FROM channels 
      WHERE is_public = true
    )
  );

CREATE POLICY "datapoint_view_owner"
  ON datapoints
  FOR SELECT
  USING (
    channel_id IN (
      SELECT id 
      FROM channels 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "datapoint_view_member"
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

-- Create a materialized view for faster access
CREATE MATERIALIZED VIEW IF NOT EXISTS channel_access AS
SELECT DISTINCT
  c.id as channel_id,
  c.user_id as owner_id,
  c.is_public,
  cm.user_id as member_id
FROM channels c
LEFT JOIN channel_members cm ON cm.channel_id = c.id;

CREATE INDEX IF NOT EXISTS idx_channel_access_owner ON channel_access(owner_id);
CREATE INDEX IF NOT EXISTS idx_channel_access_member ON channel_access(member_id);

-- Create a simplified function to get user's channels
CREATE OR REPLACE FUNCTION get_user_channels_direct(user_id_param UUID)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  user_id uuid,
  is_public boolean,
  tags text[],
  created_at timestamptz,
  updated_at timestamptz,
  api_key text,
  fields jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT c.*
  FROM channels c
  WHERE c.user_id = user_id_param
     OR c.is_public = true
     OR c.id IN (
        SELECT channel_id 
        FROM channel_members 
        WHERE user_id = user_id_param
     )
  ORDER BY c.created_at DESC;
$$;