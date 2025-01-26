-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Allow initial role assignment" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;

-- Create simplified policies
CREATE POLICY "Anyone can view roles"
  ON user_roles FOR SELECT
  USING (true);

CREATE POLICY "Allow initial role assignment"
  ON user_roles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update roles"
  ON user_roles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM roles r
      WHERE r.name = 'admin'
      AND EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_id = r.id
      )
    )
  );

CREATE POLICY "Admins can delete roles"
  ON user_roles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM roles r
      WHERE r.name = 'admin'
      AND EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid()
        AND ur.role_id = r.id
      )
    )
  );