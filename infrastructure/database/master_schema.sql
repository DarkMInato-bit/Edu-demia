-- 🏛️ Institutional Master Schema Overhaul

-- 1. Profiles Table (Linked to Supabase Auth)
-- This allows admins to manage metadata like "is_approved" easily.
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'student',
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Ensure users table has the approval column
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

-- 4. Submissions Table Update
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS feedback TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS graded_at TIMESTAMP WITH TIME ZONE;

-- 3. Courses Table Update
-- Ensure teacher_id exists and links to profiles
ALTER TABLE courses ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES profiles(id);
ALTER TABLE courses ADD COLUMN IF NOT EXISTS enrollment_code TEXT UNIQUE;

-- 3. Assignments Table Update
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS teacher_id UUID REFERENCES profiles(id);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- 5. Helper Function: Sync Profile on Signup
-- Run this to automatically create a profile record when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, is_approved)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'role',
    CASE 
      WHEN new.raw_user_meta_data->>'role' = 'teacher' THEN FALSE 
      ELSE TRUE 
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 🛡️ ADMIN POLICY: Admins can see everything
CREATE POLICY "Admins can manage all profiles" ON profiles
FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all courses" ON courses
FOR ALL USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- 🏛️ Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- 'assignment', 'grade', 'info', 'alert'
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own notifications
CREATE POLICY "Users can see their own notifications" ON notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Service role or specific backend logic can insert
CREATE POLICY "System can insert notifications" ON notifications
FOR INSERT WITH CHECK (TRUE);

-- 📡 Enable Realtime for Notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 🛡️ Faculty Oversight Policy: Teachers can see enrollments for their own courses
CREATE POLICY "Teachers can see enrollments for their courses" ON course_enrollments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM courses 
    WHERE courses.id = course_enrollments.course_id 
    AND courses.teacher_id = auth.uid()
  )
);
