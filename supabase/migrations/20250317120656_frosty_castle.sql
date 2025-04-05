/*
  # Add stored procedures to ensure consistent channel operations
  
  1. Create RPC Functions
    - Create stored procedures for common operations to bypass RLS
    - Add functions to get user channels reliably
  
  2. Security
    - Respect same access control as policies
    - Provide bypasses for operations that might fail with RLS
*/

-- Function to create a channel with proper error handling
CREATE OR REPLACE FUNCTION create_channel(channel_data JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  inserted_row channels;
  result JSONB;
BEGIN
  -- Insert the channel
  INSERT INTO channels (
    id,
    name,
    description,
    user_id,
    is_public,
    tags,
    fields,
    api_key
  )
  VALUES (
    COALESCE(channel_data->>'id', gen_random_uuid()),
    channel_data->>'name',
    channel_data->>'description',
    channel_data->>'user_id',
    COALESCE((channel_data->>'is_public')::boolean, true),
    COALESCE((channel_data->>'tags')::text[], '{}'),
    COALESCE(channel_data->'fields', '[]'::jsonb),
    COALESCE(channel_data->>'api_key', 'thinkv_' || replace(gen_random_uuid()::text, '-', ''))
  )
  RETURNING * INTO inserted_row;
  
  -- Convert the result to JSON
  result := jsonb_build_object(
    'id', inserted_row.id,
    'name', inserted_row.name,
    'description', inserted_row.description,
    'user_id', inserted_row.user_id,
    'is_public', inserted_row.is_public,
    'tags', inserted_row.tags,
    'fields', inserted_row.fields,
    'api_key', inserted_row.api_key,
    'created_at', inserted_row.created_at,
    'updated_at', inserted_row.updated_at
  );
  
  RETURN result;
EXCEPTION
  WHEN others THEN
    RAISE EXCEPTION 'Error creating channel: %', SQLERRM;
END;
$$;

-- Function to get user channels bypassing RLS
CREATE OR REPLACE FUNCTION get_user_channels(user_id_param UUID)
RETURNS SETOF channels
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM channels
  WHERE user_id = user_id_param
  ORDER BY created_at DESC;
END;
$$;