-- Add functions table
CREATE TABLE functions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE functions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for users based on school_id" ON functions
AS PERMISSIVE FOR SELECT
TO authenticated
USING (school_id = ( SELECT school_id FROM school_users WHERE user_id = auth.uid() ));

CREATE POLICY "Enable all access for admins" ON functions
AS PERMISSIVE FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM school_users WHERE school_users.user_id = auth.uid() AND school_users.role = 'admin'));

-- Add subjects table
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for users based on school_id" ON subjects
AS PERMISSIVE FOR SELECT
TO authenticated
USING (school_id = ( SELECT school_id FROM school_users WHERE user_id = auth.uid() ));

CREATE POLICY "Enable all access for admins" ON subjects
AS PERMISSIVE FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM school_users WHERE school_users.user_id = auth.uid() AND school_users.role = 'admin'));

-- Add classes table
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) NOT NULL,
    class_number TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for users based on school_id" ON classes
AS PERMISSIVE FOR SELECT
TO authenticated
USING (school_id = ( SELECT school_id FROM school_users WHERE user_id = auth.uid() ));

CREATE POLICY "Enable all access for admins" ON classes
AS PERMISSIVE FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM school_users WHERE school_users.user_id = auth.uid() AND school_users.role = 'admin'));

-- Add grades table
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) NOT NULL,
    student_id UUID REFERENCES auth.users(id) NOT NULL,
    class_id UUID REFERENCES classes(id) NOT NULL,
    subject_id UUID REFERENCES subjects(id) NOT NULL,
    grade NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for users based on school_id" ON grades
AS PERMISSIVE FOR SELECT
TO authenticated
USING (school_id = ( SELECT school_id FROM school_users WHERE user_id = auth.uid() ));

CREATE POLICY "Enable all access for teachers" ON grades
AS PERMISSIVE FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM school_users WHERE school_users.user_id = auth.uid() AND school_users.role = 'teacher'));

-- Add homework table
CREATE TABLE homework (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) NOT NULL,
    class_id UUID REFERENCES classes(id) NOT NULL,
    subject_id UUID REFERENCES subjects(id) NOT NULL,
    teacher_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE homework ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for users based on school_id" ON homework
AS PERMISSIVE FOR SELECT
TO authenticated
USING (school_id = ( SELECT school_id FROM school_users WHERE user_id = auth.uid() ));

CREATE POLICY "Enable all access for teachers" ON homework
AS PERMISSIVE FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM school_users WHERE school_users.user_id = auth.uid() AND school_users.role = 'teacher'));

-- Add quizzes table
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) NOT NULL,
    class_id UUID REFERENCES classes(id) NOT NULL,
    subject_id UUID REFERENCES subjects(id) NOT NULL,
    teacher_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for users based on school_id" ON quizzes
AS PERMISSIVE FOR SELECT
TO authenticated
USING (school_id = ( SELECT school_id FROM school_users WHERE user_id = auth.uid() ));

CREATE POLICY "Enable all access for teachers" ON quizzes
AS PERMISSIVE FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM school_users WHERE school_users.user_id = auth.uid() AND school_users.role = 'teacher'));

-- Add announcements table
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES schools(id) NOT NULL,
    teacher_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for users based on school_id" ON announcements
AS PERMISSIVE FOR SELECT
TO authenticated
USING (school_id = ( SELECT school_id FROM school_users WHERE user_id = auth.uid() ));

CREATE POLICY "Enable all access for teachers" ON announcements
AS PERMISSIVE FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM school_users WHERE school_users.user_id = auth.uid() AND school_users.role = 'teacher'));

-- Update school_users table to include first_name and last_name
ALTER TABLE school_users
ADD COLUMN first_name TEXT;

ALTER TABLE school_users
ADD COLUMN last_name TEXT;
