-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Allow initial role assignment during registration" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;

-- Create new policies
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow initial role assignment"
  ON user_roles FOR INSERT
  WITH CHECK (
    -- Allow if this is the first role for the user
    NOT EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage roles"
  ON user_roles
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur2
      JOIN roles r ON ur2.role_id = r.id
      WHERE ur2.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );