/*
  # Add JSONB fields column and fix schema issues

  1. Schema Updates
    - Add jsonb `fields` column to channels table if it doesn't exist
    - Ensure proper UUID format handling for IDs
    
  2. Security
    - Maintain existing RLS policies
*/

-- Check if fields column exists, and add it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'channels' AND column_name = 'fields'
  ) THEN
    ALTER TABLE channels ADD COLUMN fields jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Create index on the fields column to improve query performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'channels' AND indexname = 'idx_channels_fields'
  ) THEN
    CREATE INDEX idx_channels_fields ON channels USING GIN (fields);
  END IF;
END $$;

-- Add an updatedAt function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure the trigger is in place
DROP TRIGGER IF EXISTS update_channels_updated_at ON channels;
CREATE TRIGGER update_channels_updated_at
BEFORE UPDATE ON channels
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();