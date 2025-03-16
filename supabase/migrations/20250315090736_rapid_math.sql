/*
  # Add API keys to channels

  1. New Columns
    - `api_key` (text, not null) on `channels` table

  2. Changes
    - Add a NOT NULL constraint to the api_key column
    - Create index for faster API key lookups

  3. Security
    - Add policy for users to update their own channel API keys
*/

-- Add API key column to channels table
ALTER TABLE IF EXISTS channels ADD COLUMN IF NOT EXISTS api_key TEXT;

-- Update existing channels with a default API key
DO $$
BEGIN
  UPDATE channels 
  SET api_key = 'thinkv_' || replace(gen_random_uuid()::text, '-', '') 
  WHERE api_key IS NULL;
END $$;

-- Make API key non-nullable
ALTER TABLE channels ALTER COLUMN api_key SET NOT NULL;

-- Add index for faster API key lookups
CREATE INDEX IF NOT EXISTS idx_channels_api_key ON channels(api_key);

-- Add policy to allow users to regenerate their own API keys
CREATE POLICY "Users can update their own channel API keys" 
  ON channels 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);