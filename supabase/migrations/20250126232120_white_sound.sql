/*
  # Clean up user data

  1. Changes
    - Remove all data from tables that reference users first
    - Then remove user data from core tables
    - Maintains referential integrity
    
  2. Security
    - Maintains table structures and policies
    - Only removes data, not tables
*/

-- Disable RLS temporarily for cleanup
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE artists DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Delete data in correct order to maintain referential integrity
DELETE FROM user_tattoo_likes;
DELETE FROM user_tattoo_favorites;
DELETE FROM tattoo_images;
DELETE FROM business_artists;
DELETE FROM user_roles;
DELETE FROM artists;
DELETE FROM profiles;
DELETE FROM auth.users;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;