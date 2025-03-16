/*
  # Add API endpoints for IoT device data

  1. Security Updates
    - Add policy for API access with API keys
    - Enable inserting datapoints via API key

  2. Functions
    - Add function to verify API keys
*/

-- Create a function to validate API keys
CREATE OR REPLACE FUNCTION check_api_key(channel_id uuid, api_key text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM channels
    WHERE id = channel_id AND api_key = api_key
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy to allow inserting data via API key
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'datapoints' AND policyname = 'API can insert data with valid key') THEN
    CREATE POLICY "API can insert data with valid key" 
      ON datapoints 
      FOR INSERT 
      WITH CHECK (EXISTS (
        SELECT 1 FROM channels 
        WHERE channels.id = channel_id 
        AND channels.api_key = current_setting('request.headers')::json->>'x-api-key'
      ));
  END IF;
END $$;