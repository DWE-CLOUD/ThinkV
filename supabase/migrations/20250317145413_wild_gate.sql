/*
  # Fix Infinite Recursion in Database Policies
  
  1. Policy Overhaul
    - Temporarily disable RLS to clean up problematic policies
    - Drop and recreate all channel and datapoint policies with non-recursive implementation
    - Use simpler policy references that won't cause infinite recursion
  
  2. Features
    - Maintain same security model without circular references
    - Fix infinite recursion errors in policies for channels table
*/

-- Temporarily disable RLS
ALTER TABLE channels DISABLE ROW LEVEL SECURITY;
ALTER TABLE datapoints DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies for these tables
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

-- Create completely new, non-recursive channel policies
-- 1. View public channels - simple condition
CREATE POLICY "channel_public_select"
  ON channels
  FOR SELECT
  USING (is_public = true);

-- 2. View own channels - direct comparison
CREATE POLICY "channel_owner_select"
  ON channels
  FOR SELECT
  USING (user_id = auth.uid());

-- 3. Channel member access - direct reference without recursion
CREATE POLICY "channel_member_select"
  ON channels
  FOR SELECT
  USING (
    id IN (
      SELECT channel_id 
      FROM channel_members 
      WHERE user_id = auth.uid()
    )
  );

-- 4. Channel owner management policies
CREATE POLICY "channel_owner_insert"
  ON channels
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "channel_owner_update"
  ON channels
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "channel_owner_delete"
  ON channels
  FOR DELETE
  USING (user_id = auth.uid());

-- Create non-recursive datapoint policies
-- 1. Public channel data access - direct reference
CREATE POLICY "datapoint_public_select"
  ON datapoints
  FOR SELECT
  USING (
    channel_id IN (
      SELECT id 
      FROM channels 
      WHERE is_public = true
    )
  );

-- 2. Owner data access - direct reference
CREATE POLICY "datapoint_owner_select"
  ON datapoints
  FOR SELECT
  USING (
    channel_id IN (
      SELECT id 
      FROM channels 
      WHERE user_id = auth.uid()
    )
  );

-- 3. Member data access - direct reference
CREATE POLICY "datapoint_member_select"
  ON datapoints
  FOR SELECT
  USING (
    channel_id IN (
      SELECT channel_id 
      FROM channel_members 
      WHERE user_id = auth.uid()
    )
  );

-- 4. Owner data management
CREATE POLICY "datapoint_owner_insert"
  ON datapoints
  FOR INSERT
  WITH CHECK (
    channel_id IN (
      SELECT id 
      FROM channels 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "datapoint_api_insert"
  ON datapoints
  FOR INSERT
  WITH CHECK (
    channel_id IN (
      SELECT id 
      FROM channels 
      WHERE api_key = current_setting('request.headers')::json->>'x-api-key'
    )
  );

CREATE POLICY "datapoint_owner_update"
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

CREATE POLICY "datapoint_owner_delete"
  ON datapoints
  FOR DELETE
  USING (
    channel_id IN (
      SELECT id 
      FROM channels 
      WHERE user_id = auth.uid()
    )
  );

-- Create users table for joining with auth.users if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  user_metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow selecting users
CREATE POLICY "anyone_can_select_users"
  ON users
  FOR SELECT
  USING (true);

-- Create function to sync auth users to public users
CREATE OR REPLACE FUNCTION sync_user_on_auth_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.users (id, email, user_metadata)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data);
  ELSIF (TG_OP = 'UPDATE') THEN
    UPDATE public.users
    SET email = NEW.email,
        user_metadata = NEW.raw_user_meta_data
    WHERE id = NEW.id;
  ELSIF (TG_OP = 'DELETE') THEN
    DELETE FROM public.users
    WHERE id = OLD.id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to sync auth users to public users
DROP TRIGGER IF EXISTS sync_user_on_auth_change ON auth.users;
CREATE TRIGGER sync_user_on_auth_change
AFTER INSERT OR UPDATE OR DELETE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION sync_user_on_auth_change();

-- Sync existing auth users to public users
INSERT INTO public.users (id, email, user_metadata)
SELECT id, email, raw_user_meta_data
FROM auth.users
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    user_metadata = EXCLUDED.user_metadata;