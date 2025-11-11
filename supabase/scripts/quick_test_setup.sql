-- Quick Test Setup for Gamification System
-- This script creates tasks and assigns them to ALL students automatically
-- Run this in your Supabase SQL Editor

-- Step 1: Get your teacher ID (run this first to see the ID)
SELECT id, full_name FROM profiles WHERE role = 'teacher' LIMIT 1;

-- Step 2: Create test tasks with coin rewards
-- IMPORTANT: Replace 'YOUR_TEACHER_ID_HERE' with the actual teacher ID from Step 1
DO $$
DECLARE
  teacher_id uuid;
  task_id_1 uuid;
  task_id_2 uuid;
  task_id_3 uuid;
  task_id_4 uuid;
  task_id_5 uuid;
BEGIN
  -- Get the first teacher ID
  SELECT id INTO teacher_id FROM profiles WHERE role = 'teacher' LIMIT 1;
  
  IF teacher_id IS NULL THEN
    RAISE EXCEPTION 'No teacher found! Please create a teacher account first.';
  END IF;

  -- Create tasks and store their IDs
  INSERT INTO tasks (title, description, due_date, coin_reward, subject, teacher_id)
  VALUES 
    ('Complete Math Homework', 'Finish exercises 1-10 from Chapter 5', now() + interval '7 days', 50, 'Matematika Umum', teacher_id)
  RETURNING id INTO task_id_1;

  INSERT INTO tasks (title, description, due_date, coin_reward, subject, teacher_id)
  VALUES 
    ('Read Science Chapter', 'Read and summarize Chapter 3: Photosynthesis', now() + interval '5 days', 30, 'Fisika', teacher_id)
  RETURNING id INTO task_id_2;

  INSERT INTO tasks (title, description, due_date, coin_reward, subject, teacher_id)
  VALUES 
    ('History Essay', 'Write a 500-word essay on World War II', now() + interval '14 days', 100, 'Sejarah', teacher_id)
  RETURNING id INTO task_id_3;

  INSERT INTO tasks (title, description, due_date, coin_reward, subject, teacher_id)
  VALUES 
    ('Practice Spelling', 'Study spelling list for Friday quiz', now() + interval '3 days', 20, 'English', teacher_id)
  RETURNING id INTO task_id_4;

  INSERT INTO tasks (title, description, due_date, coin_reward, subject, teacher_id)
  VALUES 
    ('Art Project', 'Create a poster about environmental conservation', now() + interval '10 days', 75, 'Seni', teacher_id)
  RETURNING id INTO task_id_5;

  -- Assign tasks to ALL students automatically
  INSERT INTO task_assignments (task_id, student_id, is_completed)
  SELECT task_id_1, id, false FROM profiles WHERE role = 'student';

  INSERT INTO task_assignments (task_id, student_id, is_completed)
  SELECT task_id_2, id, false FROM profiles WHERE role = 'student';

  INSERT INTO task_assignments (task_id, student_id, is_completed)
  SELECT task_id_3, id, false FROM profiles WHERE role = 'student';

  INSERT INTO task_assignments (task_id, student_id, is_completed)
  SELECT task_id_4, id, false FROM profiles WHERE role = 'student';

  INSERT INTO task_assignments (task_id, student_id, is_completed)
  SELECT task_id_5, id, false FROM profiles WHERE role = 'student';

  RAISE NOTICE '✅ Success! Created 5 tasks and assigned them to all students.';
END $$;

-- Step 3: Verify the setup
SELECT 
  t.title,
  t.coin_reward,
  COUNT(ta.id) as assigned_to_students
FROM tasks t
LEFT JOIN task_assignments ta ON ta.task_id = t.id
GROUP BY t.id, t.title, t.coin_reward
ORDER BY t.created_at DESC
LIMIT 5;

-- Step 4: View all students and their assigned tasks
SELECT 
  p.full_name,
  p.total_coins,
  COUNT(ta.id) as total_tasks,
  COUNT(ta.id) FILTER (WHERE ta.is_completed) as completed_tasks,
  COUNT(ta.id) FILTER (WHERE NOT ta.is_completed) as pending_tasks
FROM profiles p
LEFT JOIN task_assignments ta ON ta.student_id = p.id
WHERE p.role = 'student'
GROUP BY p.id, p.full_name, p.total_coins
ORDER BY p.full_name;

-- 🎉 Done! Now you can:
-- 1. Login as a student
-- 2. See your assigned tasks on the dashboard
-- 3. Click "Complete Task" to earn coins
-- 4. Click 🏆 to view the leaderboard
