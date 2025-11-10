-- Enable Realtime for task_attachments table
ALTER PUBLICATION supabase_realtime ADD TABLE task_attachments;

-- Verify it's enabled
SELECT schemaname, tablename, 
       (SELECT EXISTS (
         SELECT 1 FROM pg_publication_tables 
         WHERE schemaname = 'public' 
         AND tablename = 'task_attachments'
       )) as is_replicated
FROM pg_tables
WHERE tablename = 'task_attachments';

-- Should return: is_replicated = true
