-- Test Data for Gamification System
-- This script creates sample students, tasks, and assignments to test the coin system

-- Note: Run this after the gamification_setup migration (003)
-- This is for testing purposes only

-- Insert test students (if they don't exist)
-- Password for all test users: "password123"
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'alice@test.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'bob@test.com', crypt('password123', gen_salt('bf')), now(), now(), now()),
  ('33333333-3333-3333-3333-333333333333', 'charlie@test.com', crypt('password123', gen_salt('bf')), now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- Insert profiles for test students
INSERT INTO profiles (id, email, full_name, role, total_coins)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'alice@test.com', 'Alice Student', 'student', 0),
  ('22222222-2222-2222-2222-222222222222', 'bob@test.com', 'Bob Student', 'student', 0),
  ('33333333-3333-3333-3333-333333333333', 'charlie@test.com', 'Charlie Student', 'student', 0)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Insert test tasks with coin rewards
INSERT INTO tasks (id, title, description, due_date, coin_reward, created_by)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Complete Math Homework', 'Finish exercises 1-10 from Chapter 5', now() + interval '7 days', 50, (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Read Science Chapter', 'Read and summarize Chapter 3: Photosynthesis', now() + interval '5 days', 30, (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'History Essay', 'Write a 500-word essay on World War II', now() + interval '14 days', 100, (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Practice Spelling', 'Study spelling list for Friday quiz', now() + interval '3 days', 20, (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1)),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Art Project', 'Create a poster about environmental conservation', now() + interval '10 days', 75, (SELECT id FROM profiles WHERE role = 'teacher' LIMIT 1))
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  coin_reward = EXCLUDED.coin_reward;

-- Assign tasks to students
INSERT INTO task_assignments (task_id, student_id, is_completed, completed_at)
VALUES 
  -- Alice: 3 tasks (2 completed, 1 pending)
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', false, NULL),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', false, NULL),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', false, NULL),
  
  -- Bob: 4 tasks (1 completed, 3 pending)
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', false, NULL),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', false, NULL),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '22222222-2222-2222-2222-222222222222', false, NULL),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '22222222-2222-2222-2222-222222222222', false, NULL),
  
  -- Charlie: 2 tasks (both pending)
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', false, NULL),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', false, NULL)
ON CONFLICT (task_id, student_id) DO NOTHING;

-- Simulate some completed tasks with coin rewards
-- Alice completes Math Homework (50 coins)
SELECT complete_task_and_award_coins(
  (SELECT id FROM task_assignments WHERE task_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' AND student_id = '11111111-1111-1111-1111-111111111111')
);

-- Alice completes Science Reading (30 coins) - Total: 80 coins
SELECT complete_task_and_award_coins(
  (SELECT id FROM task_assignments WHERE task_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' AND student_id = '11111111-1111-1111-1111-111111111111')
);

-- Bob completes Spelling Practice (20 coins)
SELECT complete_task_and_award_coins(
  (SELECT id FROM task_assignments WHERE task_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd' AND student_id = '22222222-2222-2222-2222-222222222222')
);

-- Display results
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
ORDER BY p.total_coins DESC;

-- Show leaderboard
SELECT * FROM get_leaderboard(10);
