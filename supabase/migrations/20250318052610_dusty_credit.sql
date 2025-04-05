/*
  # Fix infinite recursion in database policies
  
  1. Policy Cleanup
    - Check for existing policies before creating new ones
    - Use simpler, non-recursive policy definitions
  
  2. Security
    - Maintain same access control with cleaner implementation
*/

-- Create simplified channel policies if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channels' AND policyname = 'channel_select_public'
    ) THEN
        CREATE POLICY "channel_select_public"
          ON channels
          FOR SELECT
          USING (is_public = true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channels' AND policyname = 'channel_select_owner'
    ) THEN
        CREATE POLICY "channel_select_owner"
          ON channels
          FOR SELECT
          USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channels' AND policyname = 'channel_select_member'
    ) THEN
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
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channels' AND policyname = 'channel_insert'
    ) THEN
        CREATE POLICY "channel_insert"
          ON channels
          FOR INSERT
          WITH CHECK (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channels' AND policyname = 'channel_update'
    ) THEN
        CREATE POLICY "channel_update"
          ON channels
          FOR UPDATE
          USING (user_id = auth.uid())
          WITH CHECK (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channels' AND policyname = 'channel_delete'
    ) THEN
        CREATE POLICY "channel_delete"
          ON channels
          FOR DELETE
          USING (user_id = auth.uid());
    END IF;
END $$;

-- Create simplified datapoint policies if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'datapoints' AND policyname = 'datapoint_select_public'
    ) THEN
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
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'datapoints' AND policyname = 'datapoint_select_owner'
    ) THEN
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
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'datapoints' AND policyname = 'datapoint_select_member'
    ) THEN
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
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'datapoints' AND policyname = 'datapoint_insert_owner'
    ) THEN
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
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'datapoints' AND policyname = 'datapoint_insert_api'
    ) THEN
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
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'datapoints' AND policyname = 'datapoint_update_owner'
    ) THEN
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
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'datapoints' AND policyname = 'datapoint_delete_owner'
    ) THEN
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
    END IF;
END $$;