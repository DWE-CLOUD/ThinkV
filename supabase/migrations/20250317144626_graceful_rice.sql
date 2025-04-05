/*
  # Add channel sharing tables
  
  1. New Tables
    - channel_invitations for inviting users by email
    - channel_shares for shareable link tokens
    - channel_members for tracking who has access to which channels
  
  2. Security
    - Set up RLS policies
    - Create appropriate indexes for performance
*/

-- Drop existing policies if they exist to avoid conflicts
DO $$
BEGIN
    DROP POLICY IF EXISTS "Channel owners can manage members" ON channel_members;
    DROP POLICY IF EXISTS "Users can view their own memberships" ON channel_members;
    DROP POLICY IF EXISTS "Users can create shares for their channels" ON channel_shares;
    DROP POLICY IF EXISTS "Users can view their own channel shares" ON channel_shares;
    DROP POLICY IF EXISTS "Users can delete their own channel shares" ON channel_shares;
    DROP POLICY IF EXISTS "Users can create invitations for their channels" ON channel_invitations;
    DROP POLICY IF EXISTS "Users can view invitations they created" ON channel_invitations;
EXCEPTION
    WHEN undefined_table THEN
        NULL;
END $$;

-- Create channel_members table if it doesn't exist
CREATE TABLE IF NOT EXISTS channel_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  permissions text[] DEFAULT '{view}'::text[],
  created_at timestamptz DEFAULT now(),
  last_accessed timestamptz,
  UNIQUE(channel_id, user_id)
);

-- Create channel_shares table if it doesn't exist
CREATE TABLE IF NOT EXISTS channel_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id),
  share_token text NOT NULL UNIQUE,
  permissions text[] DEFAULT '{view}'::text[],
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create channel_invitations table if it doesn't exist
CREATE TABLE IF NOT EXISTS channel_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  invited_by uuid REFERENCES auth.users(id),
  invited_email text NOT NULL,
  share_token text NOT NULL UNIQUE,
  permissions text[] DEFAULT '{view}'::text[],
  status text DEFAULT 'pending',
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_channel_members_user ON channel_members(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_members_channel ON channel_members(channel_id);
CREATE INDEX IF NOT EXISTS idx_channel_shares_token ON channel_shares(share_token);
CREATE INDEX IF NOT EXISTS idx_channel_invitations_token ON channel_invitations(share_token);

-- Enable RLS on all tables
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_invitations ENABLE ROW LEVEL SECURITY;

-- Channel members policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channel_members' 
        AND policyname = 'channel_members_owner_access'
    ) THEN
        CREATE POLICY "channel_members_owner_access"
          ON channel_members
          FOR ALL
          USING (
            EXISTS (
              SELECT 1 FROM channels 
              WHERE channels.id = channel_members.channel_id 
              AND channels.user_id = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channel_members' 
        AND policyname = 'channel_members_self_access'
    ) THEN
        CREATE POLICY "channel_members_self_access"
          ON channel_members
          FOR SELECT
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Channel shares policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channel_shares' 
        AND policyname = 'channel_shares_owner_insert'
    ) THEN
        CREATE POLICY "channel_shares_owner_insert"
          ON channel_shares
          FOR INSERT
          WITH CHECK (
            auth.uid() = created_by AND 
            EXISTS (
              SELECT 1 FROM channels 
              WHERE channels.id = channel_shares.channel_id 
              AND channels.user_id = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channel_shares' 
        AND policyname = 'channel_shares_owner_select'
    ) THEN
        CREATE POLICY "channel_shares_owner_select"
          ON channel_shares
          FOR SELECT
          USING (auth.uid() = created_by);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channel_shares' 
        AND policyname = 'channel_shares_owner_delete'
    ) THEN
        CREATE POLICY "channel_shares_owner_delete"
          ON channel_shares
          FOR DELETE
          USING (auth.uid() = created_by);
    END IF;
END $$;

-- Channel invitations policies
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channel_invitations' 
        AND policyname = 'channel_invitations_owner_insert'
    ) THEN
        CREATE POLICY "channel_invitations_owner_insert"
          ON channel_invitations
          FOR INSERT
          WITH CHECK (
            auth.uid() = invited_by AND 
            EXISTS (
              SELECT 1 FROM channels 
              WHERE channels.id = channel_invitations.channel_id 
              AND channels.user_id = auth.uid()
            )
          );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'channel_invitations' 
        AND policyname = 'channel_invitations_owner_select'
    ) THEN
        CREATE POLICY "channel_invitations_owner_select"
          ON channel_invitations
          FOR SELECT
          USING (auth.uid() = invited_by);
    END IF;
END $$;