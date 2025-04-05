/*
  # Fix infinite recursion and policy conflicts
  
  1. Policy Cleanup
    - Check for existing policies before creating
    - Use simpler, non-recursive policy definitions
  
  2. Security
    - Maintain same access control with cleaner implementation
*/

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

-- Create materialized view for access control if it doesn't exist
DROP MATERIALIZED VIEW IF EXISTS channel_access;
CREATE MATERIALIZED VIEW channel_access AS
SELECT DISTINCT
    c.id as channel_id,
    c.user_id as owner_id,
    c.is_public,
    cm.user_id as member_id
FROM channels c
LEFT JOIN channel_members cm ON cm.channel_id = c.id;

-- Create indexes if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_channel_access_unique'
    ) THEN
        CREATE UNIQUE INDEX idx_channel_access_unique 
        ON channel_access(channel_id, COALESCE(member_id, '00000000-0000-0000-0000-000000000000'));
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_channel_access_owner'
    ) THEN
        CREATE INDEX idx_channel_access_owner ON channel_access(owner_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_channel_access_member'
    ) THEN
        CREATE INDEX idx_channel_access_member ON channel_access(member_id);
    END IF;
END $$;

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_channel_access()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY channel_access;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to refresh materialized view
DROP TRIGGER IF EXISTS refresh_channel_access_channels ON channels;
CREATE TRIGGER refresh_channel_access_channels
AFTER INSERT OR UPDATE OR DELETE ON channels
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_channel_access();

DROP TRIGGER IF EXISTS refresh_channel_access_members ON channel_members;
CREATE TRIGGER refresh_channel_access_members
AFTER INSERT OR UPDATE OR DELETE ON channel_members
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_channel_access();

-- Create simplified channel policies using materialized view
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channels' AND policyname = 'channels_access'
    ) THEN
        CREATE POLICY "channels_access"
            ON channels
            FOR SELECT
            USING (
                id IN (
                    SELECT channel_id
                    FROM channel_access
                    WHERE is_public = true
                       OR owner_id = auth.uid()
                       OR member_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channels' AND policyname = 'channels_insert'
    ) THEN
        CREATE POLICY "channels_insert"
            ON channels
            FOR INSERT
            WITH CHECK (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channels' AND policyname = 'channels_update'
    ) THEN
        CREATE POLICY "channels_update"
            ON channels
            FOR UPDATE
            USING (user_id = auth.uid())
            WITH CHECK (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channels' AND policyname = 'channels_delete'
    ) THEN
        CREATE POLICY "channels_delete"
            ON channels
            FOR DELETE
            USING (user_id = auth.uid());
    END IF;
END $$;

-- Create simplified datapoint policies using materialized view
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'datapoints' AND policyname = 'datapoints_access'
    ) THEN
        CREATE POLICY "datapoints_access"
            ON datapoints
            FOR SELECT
            USING (
                channel_id IN (
                    SELECT channel_id
                    FROM channel_access
                    WHERE is_public = true
                       OR owner_id = auth.uid()
                       OR member_id = auth.uid()
                )
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'datapoints' AND policyname = 'datapoints_insert'
    ) THEN
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
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'datapoints' AND policyname = 'datapoints_update'
    ) THEN
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
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'datapoints' AND policyname = 'datapoints_delete'
    ) THEN
        CREATE POLICY "datapoints_delete"
            ON datapoints
            FOR DELETE
            USING (
                channel_id IN (
                    SELECT id FROM channels WHERE user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- Create simplified function to get user's channels
CREATE OR REPLACE FUNCTION get_user_channels_direct(user_id_param UUID)
RETURNS SETOF channels
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT DISTINCT c.*
    FROM channels c
    INNER JOIN channel_access ca ON c.id = ca.channel_id
    WHERE ca.is_public = true
       OR ca.owner_id = user_id_param
       OR ca.member_id = user_id_param
    ORDER BY c.created_at DESC;
$$;