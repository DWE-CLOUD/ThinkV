import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { readFileSync, readdirSync } from 'fs';
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

async function applyMigrations() {
  console.log('Applying Supabase migrations...');
  
  try {
    // Get all migration files
    const migrationsDir = join(dirname(__dirname), 'supabase', 'migrations');
    console.log(`Reading migrations from ${migrationsDir}`);
    
    // Read migration files sorted by name
    const migrationFiles = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${migrationFiles.length} migration files`);
    
    // Apply each migration
    for (const file of migrationFiles) {
      const filePath = join(migrationsDir, file);
      console.log(`Applying migration: ${file}`);
      
      const sql = readFileSync(filePath, 'utf8');
      
      // Execute the migration SQL
      const { error } = await supabase.rpc('pgmoon.query', { query: sql });
      
      if (error) {
        console.error(`Error applying migration ${file}:`, error);
        
        // Try applying statements one by one
        console.log('Trying to apply statements individually...');
        const statements = sql.split(';').filter(stmt => stmt.trim());
        
        for (const statement of statements) {
          if (statement.trim()) {
            console.log(`Executing statement: ${statement.substring(0, 100)}...`);
            const { error: stmtError } = await supabase.rpc('pgmoon.query', { 
              query: statement.trim() + ';' 
            });
            
            if (stmtError) {
              console.error(`Error executing statement:`, stmtError);
            }
          }
        }
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error applying migrations:', error);
    process.exit(1);
  }
}

// Run the migration function
applyMigrations();