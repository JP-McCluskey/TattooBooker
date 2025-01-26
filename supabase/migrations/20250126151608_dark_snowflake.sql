/*
  # Fix user_roles policies

  1. Changes
    - Drop existing policies
    - Add new policy to allow user registration flow
    - Keep policy for admin management
    - Add policy for viewing own roles
*/

-- Drop existing policies
DROP POLICY IF EXISTS "User roles viewable by all" ON user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update user roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON user_roles;

-- Create new policies
CREATE POLICY "Users can view their own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Allow initial role assignment during registration"
  ON user_roles FOR INSERT
  WITH CHECK (
    -- Allow if no existing roles for this user
    NOT EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
    )
    -- Or if admin
    OR EXISTS (
      SELECT 1 FROM user_roles ur
      INNER JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );

CREATE POLICY "Admins can manage all roles"
  ON user_roles
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      INNER JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name = 'admin'
    )
  );