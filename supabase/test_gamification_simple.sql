-- Simple Test Data for Gamification System
-- Run this in your Supabase SQL Editor after logging in as a teacher and creating some students

-- Step 1: First, manually create test users via Supabase Auth UI or your app:
--   - Teacher: teacher@test.com / password123
--   - Students: student1@test.com, student2@test.com, student3@test.com / password123

-- Step 2: Get the teacher's ID (replace with your actual teacher ID)
-- SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1;

-- Step 3: Insert test tasks with coin rewards
-- Replace 'YOUR_TEACHER_ID' with the actual teacher ID from Step 2

INSERT INTO tasks (title, description, due_date, coin_reward, created_by)
VALUES 
  ('Complete Math Homework', 'Finish exercises 1-10 from Chapter 5', now() + interval '7 days', 50, 'YOUR_TEACHER_ID'),
  ('Read Science Chapter', 'Read and summarize Chapter 3: Photosynthesis', now() + interval '5 days', 30, 'YOUR_TEACHER_ID'),
  ('History Essay', 'Write a 500-word essay on World War II', now() + interval '14 days', 100, 'YOUR_TEACHER_ID'),
  ('Practice Spelling', 'Study spelling list for Friday quiz', now() + interval '3 days', 20, 'YOUR_TEACHER_ID'),
  ('Art Project', 'Create a poster about environmental conservation', now() + interval '10 days', 75, 'YOUR_TEACHER_ID');

-- Step 4: Get student IDs
-- SELECT id, email, full_name FROM profiles WHERE role = 'student';

-- Step 5: Assign tasks to students
-- Replace STUDENT_ID_1, STUDENT_ID_2, STUDENT_ID_3 with actual student IDs
-- Replace TASK_ID_X with actual task IDs from the tasks table

-- Example assignments (modify with your actual IDs):
/*
INSERT INTO task_assignments (task_id, student_id, is_completed)
VALUES 
  ('TASK_ID_1', 'STUDENT_ID_1', false),
  ('TASK_ID_2', 'STUDENT_ID_1', false),
  ('TASK_ID_3', 'STUDENT_ID_1', false),
  ('TASK_ID_1', 'STUDENT_ID_2', false),
  ('TASK_ID_2', 'STUDENT_ID_2', false),
  ('TASK_ID_4', 'STUDENT_ID_2', false),
  ('TASK_ID_3', 'STUDENT_ID_3', false),
  ('TASK_ID_5', 'STUDENT_ID_3', false);
*/

-- Step 6: Test completing a task and awarding coins
-- Get a task assignment ID and complete it:
/*
SELECT id, task_id, student_id, is_completed 
FROM task_assignments 
WHERE is_completed = false 
LIMIT 1;

-- Complete the task (replace ASSIGNMENT_ID with actual ID):
SELECT complete_task_and_award_coins('ASSIGNMENT_ID');
*/

-- Step 7: View the leaderboard
SELECT * FROM get_leaderboard(10);

-- Step 8: Check student coins
SELECT 
  p.full_name,
  p.email,
  p.total_coins,
  COUNT(ta.id) as total_tasks,
  COUNT(ta.id) FILTER (WHERE ta.is_completed) as completed_tasks
FROM profiles p
LEFT JOIN task_assignments ta ON ta.student_id = p.id
WHERE p.role = 'student'
GROUP BY p.id, p.full_name, p.email, p.total_coins
ORDER BY p.total_coins DESC;
