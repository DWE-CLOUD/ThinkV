import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get Supabase URL and anon key from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupDatabase() {
  console.log('Setting up database...');

  try {
    // SQL for creating the database structure
    const setupSql = `
    -- Create the channels table if it doesn't exist already
    CREATE TABLE IF NOT EXISTS channels (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      description text,
      user_id uuid REFERENCES auth.users(id),
      is_public boolean DEFAULT true,
      tags text[] DEFAULT '{}',
      fields jsonb DEFAULT '[]',
      api_key text UNIQUE DEFAULT ('thinkv_' || replace(gen_random_uuid()::text, '-', '')),
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );

    -- Create the datapoints table for time-series data
    CREATE TABLE IF NOT EXISTS datapoints (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
      field_id text NOT NULL,
      value float NOT NULL,
      timestamp timestamptz NOT NULL,
      created_at timestamptz DEFAULT now()
    );

    -- Create indexes for faster queries (if they don't exist)
    CREATE INDEX IF NOT EXISTS idx_datapoints_channel_id ON datapoints(channel_id);
    CREATE INDEX IF NOT EXISTS idx_datapoints_timestamp ON datapoints(timestamp);
    CREATE INDEX IF NOT EXISTS idx_datapoints_field_id ON datapoints(field_id);
    CREATE INDEX IF NOT EXISTS idx_channels_user_id ON channels(user_id);
    CREATE INDEX IF NOT EXISTS idx_channels_api_key ON channels(api_key);
    CREATE INDEX IF NOT EXISTS idx_channels_fields ON channels USING GIN (fields);

    -- Enable Row Level Security (if not already enabled)
    ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
    ALTER TABLE datapoints ENABLE ROW LEVEL SECURITY;

    -- Create function to update the "updated_at" timestamp if it doesn't exist
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Drop and recreate trigger
    DROP TRIGGER IF EXISTS update_channels_updated_at ON channels;
    CREATE TRIGGER update_channels_updated_at
    BEFORE UPDATE ON channels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
    `;

    // Execute the setup SQL
    const { error: setupError } = await supabase.rpc('pgmoon.query', { query: setupSql });
    
    if (setupError) {
      console.error('Error setting up the database structure:', setupError);
      // Try a different approach
      console.log('Trying an alternative approach...');
      
      // We'll run each statement separately
      const statements = setupSql.split(';').filter(stmt => stmt.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.rpc('pgmoon.query', { query: statement.trim() + ';' });
          if (error) {
            console.warn(`Warning: Statement execution error (possibly already exists): ${error.message}`);
            console.log('Statement was:', statement.trim());
          }
        }
      }
    }

    // Setup RLS policies
    const policiesSql = `
    -- Check if policies exist before creating them
    DO $$
    BEGIN
        -- Policies for channels table
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'channels' AND policyname = 'Users can view their own channels') THEN
            CREATE POLICY "Users can view their own channels" 
              ON channels 
              FOR SELECT 
              USING (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'channels' AND policyname = 'Users can create their own channels') THEN
            CREATE POLICY "Users can create their own channels" 
              ON channels 
              FOR INSERT 
              WITH CHECK (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'channels' AND policyname = 'Users can update their own channels') THEN
            CREATE POLICY "Users can update their own channels" 
              ON channels 
              FOR UPDATE 
              USING (auth.uid() = user_id)
              WITH CHECK (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'channels' AND policyname = 'Users can delete their own channels') THEN
            CREATE POLICY "Users can delete their own channels" 
              ON channels 
              FOR DELETE 
              USING (auth.uid() = user_id);
        END IF;

        -- Policies for datapoints table
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'datapoints' AND policyname = 'Users can view datapoints of their channels') THEN
            CREATE POLICY "Users can view datapoints of their channels" 
              ON datapoints 
              FOR SELECT 
              USING (EXISTS (
                SELECT 1 FROM channels 
                WHERE channels.id = datapoints.channel_id 
                AND channels.user_id = auth.uid()
              ));
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'datapoints' AND policyname = 'Users can insert datapoints to their channels') THEN
            CREATE POLICY "Users can insert datapoints to their channels" 
              ON datapoints 
              FOR INSERT 
              WITH CHECK (EXISTS (
                SELECT 1 FROM channels 
                WHERE channels.id = datapoints.channel_id 
                AND channels.user_id = auth.uid()
              ));
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'datapoints' AND policyname = 'Users can update datapoints of their channels') THEN
            CREATE POLICY "Users can update datapoints of their channels" 
              ON datapoints 
              FOR UPDATE 
              USING (EXISTS (
                SELECT 1 FROM channels 
                WHERE channels.id = datapoints.channel_id 
                AND channels.user_id = auth.uid()
              ))
              WITH CHECK (EXISTS (
                SELECT 1 FROM channels 
                WHERE channels.id = datapoints.channel_id 
                AND channels.user_id = auth.uid()
              ));
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'datapoints' AND policyname = 'Users can delete datapoints of their channels') THEN
            CREATE POLICY "Users can delete datapoints of their channels" 
              ON datapoints 
              FOR DELETE 
              USING (EXISTS (
                SELECT 1 FROM channels 
                WHERE channels.id = datapoints.channel_id 
                AND channels.user_id = auth.uid()
              ));
        END IF;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'datapoints' AND policyname = 'API can insert data with valid key') THEN
            CREATE POLICY "API can insert data with valid key" 
              ON datapoints 
              FOR INSERT 
              WITH CHECK (EXISTS (
                SELECT 1 FROM channels 
                WHERE channels.id = datapoints.channel_id 
                AND channels.api_key = current_setting('request.headers')::json->>'x-api-key'
              ));
        END IF;
    END $$;
    `;

    const { error: policiesError } = await supabase.rpc('pgmoon.query', { query: policiesSql });
    
    if (policiesError) {
      console.error('Error setting up RLS policies:', policiesError);
    } else {
      console.log('RLS policies setup completed successfully.');
    }

    console.log('Database setup completed successfully.');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();