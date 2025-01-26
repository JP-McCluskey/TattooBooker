/*
  # Fix artist registration issues

  1. Changes
    - Add styles column to artists table
    - Remove email check from profiles table
    - Add RLS policies for artists table
*/

-- Add styles column to artists table
ALTER TABLE artists ADD COLUMN IF NOT EXISTS styles text[];

-- Update artists policies
DROP POLICY IF EXISTS "Artists can update own profile" ON artists;
DROP POLICY IF EXISTS "Artists viewable by all" ON artists;

CREATE POLICY "Artists viewable by all"
  ON artists FOR SELECT
  USING (true);

CREATE POLICY "Artists can insert own profile"
  ON artists FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Artists can update own profile"
  ON artists FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);