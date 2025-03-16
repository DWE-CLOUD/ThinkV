import { supabase } from './supabase';

// Check if database has been initialized before
const DB_INIT_KEY = 'thinkv_db_initialized';

// Function to setup database tables and policies
export async function setupDatabase() {
  // Check if we've already set up the database in this browser
  const isInitialized = localStorage.getItem(DB_INIT_KEY);
  if (isInitialized === 'true') {
    return;
  }

  try {
    console.log('Checking database setup...');

    // First check if the channels table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('channels')
      .select('id')
      .limit(1);

    // If we get a specific error indicating the table doesn't exist, or no error but empty data
    // we should try to initialize the database
    const shouldInitialize = tableError || !tableExists || tableExists.length === 0;

    if (shouldInitialize) {
      console.log('Need to initialize database, please run `npm run setup-db` manually');
      // Don't mark as initialized if we couldn't set it up
      return;
    }

    // Mark as initialized in localStorage
    localStorage.setItem(DB_INIT_KEY, 'true');
    console.log('Database already set up.');
  } catch (error) {
    console.error('Error checking database setup:', error);
  }
}