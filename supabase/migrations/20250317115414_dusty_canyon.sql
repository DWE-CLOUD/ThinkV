/*
  # Additional fixes for database policies to prevent infinite recursion

  1. Policy Updates
    - Update and clarify policy names for better understanding
    - Ensure no circular references in policy definitions
  
  2. Security
    - Maintain proper access control with non-recursive policies
*/

-- Drop any remaining problematic policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their channel datapoints" ON datapoints;
DROP POLICY IF EXISTS "Users can view shared channel datapoints" ON datapoints;

-- Create clear, non-recursive policies
DO $$
BEGIN
    -- Public channels view policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channels' AND policyname = 'Public channels viewable by anyone'
    ) THEN
        CREATE POLICY "Public channels viewable by anyone"
        ON channels
        FOR SELECT
        USING (is_public = true);
    END IF;

    -- User's own channels policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channels' AND policyname = 'Direct channel ownership access'
    ) THEN
        CREATE POLICY "Direct channel ownership access"
        ON channels
        FOR SELECT
        USING (user_id = auth.uid());
    END IF;

    -- Member channel access policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channels' AND policyname = 'Channel member access'
    ) THEN
        CREATE POLICY "Channel member access"
        ON channels
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM channel_members
                WHERE channel_members.channel_id = id 
                AND channel_members.user_id = auth.uid()
            )
        );
    END IF;

    -- Datapoints in public channels
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'datapoints' AND policyname = 'Public channel data access'
    ) THEN
        CREATE POLICY "Public channel data access"
        ON datapoints
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM channels
                WHERE channels.id = channel_id
                AND channels.is_public = true
            )
        );
    END IF;

    -- Datapoints in own channels
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'datapoints' AND policyname = 'Owner channel data access'
    ) THEN
        CREATE POLICY "Owner channel data access"
        ON datapoints
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM channels
                WHERE channels.id = channel_id
                AND channels.user_id = auth.uid()
            )
        );
    END IF;

    -- Datapoints in channels where user is a member
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'datapoints' AND policyname = 'Member channel data access'
    ) THEN
        CREATE POLICY "Member channel data access"
        ON datapoints
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM channel_members
                WHERE channel_members.channel_id = channel_id
                AND channel_members.user_id = auth.uid()
            )
        );
    END IF;
END
$$;