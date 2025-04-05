/*
  # Fix and optimize database access with direct access functions
  
  1. Create channel_access function
    - Provides direct access to user's channels
    - Bypasses RLS completely
    - Returns a complete set of channels the user has access to
  
  2. Cleanup
    - Creates a consolidated approach to channel access
*/

-- Create helper function to get user's channels directly and efficiently
CREATE OR REPLACE FUNCTION get_user_channels_direct(user_id_param UUID)
RETURNS SETOF channels
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM channels
  WHERE user_id = user_id_param
     OR is_public = true
     OR id IN (
        SELECT channel_id 
        FROM channel_members 
        WHERE user_id = user_id_param
     )
  ORDER BY created_at DESC;
END;
$$;