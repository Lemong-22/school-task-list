-- Add More Test Tasks
-- Run this to create more tasks for testing the modal animation

DO $$
DECLARE
  teacher_id uuid;
  task_id_1 uuid;
  task_id_2 uuid;
  task_id_3 uuid;
BEGIN
  -- Get the first teacher ID
  SELECT id INTO teacher_id FROM profiles WHERE role = 'teacher' LIMIT 1;
  
  IF teacher_id IS NULL THEN
    RAISE EXCEPTION 'No teacher found!';
  END IF;

  -- Create 3 more tasks
  INSERT INTO tasks (title, description, due_date, coin_reward, subject, teacher_id)
  VALUES 
    ('Geography Quiz', 'Study capitals of Asian countries', now() + interval '5 days', 40, 'Sejarah', teacher_id)
  RETURNING id INTO task_id_1;

  INSERT INTO tasks (title, description, due_date, coin_reward, subject, teacher_id)
  VALUES 
    ('Chemistry Lab Report', 'Write lab report for experiment 5', now() + interval '8 days', 60, 'Kimia', teacher_id)
  RETURNING id INTO task_id_2;

  INSERT INTO tasks (title, description, due_date, coin_reward, subject, teacher_id)
  VALUES 
    ('Music Practice', 'Practice scales and arpeggios', now() + interval '4 days', 25, 'Seni', teacher_id)
  RETURNING id INTO task_id_3;

  -- Assign to all students
  INSERT INTO task_assignments (task_id, student_id, is_completed)
  SELECT task_id_1, id, false FROM profiles WHERE role = 'student';

  INSERT INTO task_assignments (task_id, student_id, is_completed)
  SELECT task_id_2, id, false FROM profiles WHERE role = 'student';

  INSERT INTO task_assignments (task_id, student_id, is_completed)
  SELECT task_id_3, id, false FROM profiles WHERE role = 'student';

  RAISE NOTICE '✅ Created 3 more tasks!';
END $$;
