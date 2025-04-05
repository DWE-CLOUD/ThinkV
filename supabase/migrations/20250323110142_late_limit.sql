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

-- Create non-recursive channel policies
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

-- Create non-recursive datapoint policies
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
      WHERE api_key = current_setting('request.headers')::json->>'x-api-key'
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