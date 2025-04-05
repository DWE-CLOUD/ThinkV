/*
  # Fix infinite recursion in channel policies

  1. Policy Updates
    - Fix recursive policies for channels and datapoints
    - Rewrite with proper references to avoid circular dependencies
  
  2. Security
    - Maintain the same access controls without recursion errors
*/

-- Drop only the problematic policies that may be causing recursion
DROP POLICY IF EXISTS "Users can view channels they have access to" ON channels;
DROP POLICY IF EXISTS "Users can view datapoints of channels they have access to" ON datapoints;

-- Create policies using DO block to check if they exist first
DO $$
BEGIN
    -- Create "Anyone can view public channels" policy only if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channels' AND policyname = 'Anyone can view public channels'
    ) THEN
        CREATE POLICY "Anyone can view public channels"
        ON channels
        FOR SELECT
        USING (is_public = true);
    END IF;

    -- Create "Users can view their own channels" policy only if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channels' AND policyname = 'Users can view their own channels'
    ) THEN
        CREATE POLICY "Users can view their own channels"
        ON channels
        FOR SELECT
        USING (auth.uid() = user_id);
    END IF;

    -- Create "Users can view shared channels" policy only if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channels' AND policyname = 'Users can view shared channels'
    ) THEN
        CREATE POLICY "Users can view shared channels"
        ON channels
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM channel_members
                WHERE channel_members.channel_id = channels.id 
                AND channel_members.user_id = auth.uid()
            )
        );
    END IF;

    -- Create "Anyone can view data from public channels" policy only if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'datapoints' AND policyname = 'Anyone can view data from public channels'
    ) THEN
        CREATE POLICY "Anyone can view data from public channels"
        ON datapoints
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM channels
                WHERE channels.id = datapoints.channel_id
                AND channels.is_public = true
            )
        );
    END IF;

    -- Create "Users can view datapoints of their channels" policy only if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'datapoints' AND policyname = 'Users can view datapoints of their channels'
    ) THEN
        CREATE POLICY "Users can view datapoints of their channels"
        ON datapoints
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM channels
                WHERE channels.id = datapoints.channel_id
                AND channels.user_id = auth.uid()
            )
        );
    END IF;

    -- Create "Users can view member datapoints" policy only if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'datapoints' AND policyname = 'Users can view member datapoints'
    ) THEN
        CREATE POLICY "Users can view member datapoints"
        ON datapoints
        FOR SELECT
        USING (
            EXISTS (
                SELECT 1 FROM channel_members
                WHERE channel_members.channel_id = datapoints.channel_id
                AND channel_members.user_id = auth.uid()
            )
        );
    END IF;
END
$$;