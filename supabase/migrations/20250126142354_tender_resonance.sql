/*
  # Add user interactions tables

  1. New Tables
    - `user_tattoo_likes`
      - `user_id` (uuid, references auth.users)
      - `tattoo_id` (uuid, references tattoo_images)
      - `created_at` (timestamptz)
    - `user_tattoo_favorites`
      - `user_id` (uuid, references auth.users)
      - `tattoo_id` (uuid, references tattoo_images)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for managing likes and favorites
*/

-- Create user_tattoo_likes table
CREATE TABLE IF NOT EXISTS user_tattoo_likes (
  user_id uuid REFERENCES auth.users(id),
  tattoo_id uuid REFERENCES tattoo_images(id),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, tattoo_id)
);

-- Create user_tattoo_favorites table
CREATE TABLE IF NOT EXISTS user_tattoo_favorites (
  user_id uuid REFERENCES auth.users(id),
  tattoo_id uuid REFERENCES tattoo_images(id),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, tattoo_id)
);

-- Enable RLS
ALTER TABLE user_tattoo_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tattoo_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for user_tattoo_likes
CREATE POLICY "Users can view all likes"
  ON user_tattoo_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own likes"
  ON user_tattoo_likes
  USING (auth.uid() = user_id);

-- Create policies for user_tattoo_favorites
CREATE POLICY "Users can view all favorites"
  ON user_tattoo_favorites
  FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own favorites"
  ON user_tattoo_favorites
  USING (auth.uid() = user_id);

-- Create functions to handle likes and favorites
CREATE OR REPLACE FUNCTION toggle_tattoo_like(p_tattoo_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_liked boolean;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if the user has already liked the tattoo
  IF EXISTS (
    SELECT 1 FROM user_tattoo_likes
    WHERE user_id = v_user_id AND tattoo_id = p_tattoo_id
  ) THEN
    -- Unlike
    DELETE FROM user_tattoo_likes
    WHERE user_id = v_user_id AND tattoo_id = p_tattoo_id;
    
    -- Update likes count
    UPDATE tattoo_images
    SET likes_count = likes_count - 1
    WHERE id = p_tattoo_id;
    
    v_liked := false;
  ELSE
    -- Like
    INSERT INTO user_tattoo_likes (user_id, tattoo_id)
    VALUES (v_user_id, p_tattoo_id);
    
    -- Update likes count
    UPDATE tattoo_images
    SET likes_count = likes_count + 1
    WHERE id = p_tattoo_id;
    
    v_liked := true;
  END IF;
  
  RETURN v_liked;
END;
$$;

CREATE OR REPLACE FUNCTION toggle_tattoo_favorite(p_tattoo_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_favorited boolean;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Check if the user has already favorited the tattoo
  IF EXISTS (
    SELECT 1 FROM user_tattoo_favorites
    WHERE user_id = v_user_id AND tattoo_id = p_tattoo_id
  ) THEN
    -- Unfavorite
    DELETE FROM user_tattoo_favorites
    WHERE user_id = v_user_id AND tattoo_id = p_tattoo_id;
    
    -- Update favorites count
    UPDATE tattoo_images
    SET favorites_count = favorites_count - 1
    WHERE id = p_tattoo_id;
    
    v_favorited := false;
  ELSE
    -- Favorite
    INSERT INTO user_tattoo_favorites (user_id, tattoo_id)
    VALUES (v_user_id, p_tattoo_id);
    
    -- Update favorites count
    UPDATE tattoo_images
    SET favorites_count = favorites_count + 1
    WHERE id = p_tattoo_id;
    
    v_favorited := true;
  END IF;
  
  RETURN v_favorited;
END;
$$;