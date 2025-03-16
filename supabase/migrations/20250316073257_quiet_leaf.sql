/*
  # Initial Schema Setup for ANKO Education Platform

  1. New Tables
    - schools
      - id (uuid, primary key)
      - name (text)
      - status (text) - pending/approved/rejected
      - created_at (timestamp)
      - admin_id (uuid) - references auth.users
    
    - school_users
      - id (uuid, primary key)
      - user_id (uuid) - references auth.users
      - school_id (uuid) - references schools
      - role (text) - admin/teacher/student/parent
      - status (text) - pending/active/inactive
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
*/

-- Create schools table
CREATE TABLE schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  admin_id uuid REFERENCES auth.users NOT NULL,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Create school_users table
CREATE TABLE school_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  school_id uuid REFERENCES schools NOT NULL,
  role text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('admin', 'teacher', 'student', 'parent')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'inactive')),
  UNIQUE(user_id, school_id)
);

-- Enable RLS
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_users ENABLE ROW LEVEL SECURITY;

-- Policies for schools table
CREATE POLICY "Anyone can view approved schools"
  ON schools
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "School admins can view their pending schools"
  ON schools
  FOR SELECT
  USING (admin_id = auth.uid());

CREATE POLICY "Platform admin can view all schools"
  ON schools
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM school_users
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND status = 'active'
      AND school_id IS NULL
    )
  );

CREATE POLICY "Users can create schools"
  ON schools
  FOR INSERT
  TO authenticated
  WITH CHECK (admin_id = auth.uid());

-- Policies for school_users table
CREATE POLICY "Users can view their own school associations"
  ON school_users
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "School admins can manage their school users"
  ON school_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM school_users su
      WHERE su.school_id = school_users.school_id
      AND su.user_id = auth.uid()
      AND su.role = 'admin'
      AND su.status = 'active'
    )
  );

CREATE POLICY "Platform admin can manage all school users"
  ON school_users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM school_users
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND status = 'active'
      AND school_id IS NULL
    )
  );
