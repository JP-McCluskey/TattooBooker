-- Update the tattoo_images policies to ensure users can insert their own images
DROP POLICY IF EXISTS "Users can upload their own images" ON tattoo_images;

CREATE POLICY "Users can upload their own images"
  ON tattoo_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    user_id IS NULL
  );

-- Ensure the storage.objects policies are properly applied
DO $$
BEGIN
  -- Refresh storage policies
  DROP POLICY IF EXISTS "Images are publicly accessible" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

  CREATE POLICY "Images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'images');

  CREATE POLICY "Authenticated users can upload images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'images' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );

  CREATE POLICY "Users can update their own images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'images' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );

  CREATE POLICY "Users can delete their own images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'images' AND
      auth.uid()::text = (storage.foldername(name))[1]
    );
END $$;