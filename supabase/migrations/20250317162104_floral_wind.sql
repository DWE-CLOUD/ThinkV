/*
  # Fix channel_shares policies and triggers for proper functionality
  
  1. Feature Enhancement
    - Add policies to ensure channel_shares APIs work correctly
    - Fix path for share links to work properly
    - Update channel_shares with trigger to allow users to make links
  
  2. Security
    - Enable proper RLS for secure sharing
*/

-- Ensure we have the channel_shares table
CREATE TABLE IF NOT EXISTS channel_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id),
  share_token text NOT NULL UNIQUE,
  permissions text[] DEFAULT '{view}'::text[],
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster token lookups if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_channel_shares_token ON channel_shares(share_token);

-- Enable RLS
ALTER TABLE channel_shares ENABLE ROW LEVEL SECURITY;

-- Fix policies for channel_shares
DO $$
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "channel_shares_owner_insert" ON channel_shares;
    DROP POLICY IF EXISTS "channel_shares_owner_select" ON channel_shares;
    DROP POLICY IF EXISTS "channel_shares_owner_delete" ON channel_shares;
    
    -- Create new policies
    CREATE POLICY "channel_shares_owner_insert"
      ON channel_shares
      FOR INSERT
      WITH CHECK (
        auth.uid() = created_by
      );
      
    CREATE POLICY "channel_shares_owner_select"
      ON channel_shares
      FOR SELECT
      USING (
        auth.uid() = created_by OR
        share_token = COALESCE(current_setting('request.headers', true)::json->>'share-token', '')
      );
      
    CREATE POLICY "channel_shares_owner_delete"
      ON channel_shares
      FOR DELETE
      USING (auth.uid() = created_by);
END $$;

-- Create channel_shares trigger function to validate permission to share
CREATE OR REPLACE FUNCTION validate_channel_share()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the user has permission to share this channel
  IF NOT EXISTS (
    SELECT 1 FROM channels
    WHERE id = NEW.channel_id
    AND (user_id = NEW.created_by OR
         EXISTS (
           SELECT 1 FROM channel_members
           WHERE channel_id = NEW.channel_id
           AND user_id = NEW.created_by
           AND (permissions && '{admin}'::text[] OR permissions && '{edit}'::text[])
         ))
  ) THEN
    RAISE EXCEPTION 'No permission to create share link for this channel';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for channel_shares
DROP TRIGGER IF EXISTS validate_channel_share_trigger ON channel_shares;
CREATE TRIGGER validate_channel_share_trigger
BEFORE INSERT ON channel_shares
FOR EACH ROW
EXECUTE FUNCTION validate_channel_share();