-- ============================================================================
-- Verification Query: Check if new columns exist in profiles table
-- ============================================================================

-- Check what columns exist in profiles table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- If columns are missing, this will add them:
-- Uncomment and run these if the columns don't exist:

/*
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS active_title_id UUID REFERENCES shop_items(id) ON DELETE SET NULL;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS equipped_badges JSONB DEFAULT '[]'::jsonb NOT NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_profiles_active_title ON profiles(active_title_id);
CREATE INDEX IF NOT EXISTS idx_profiles_equipped_badges ON profiles USING GIN(equipped_badges);

-- Add constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS check_equipped_badges_max_6;

ALTER TABLE profiles
ADD CONSTRAINT check_equipped_badges_max_6 
CHECK (jsonb_array_length(equipped_badges) <= 6);
*/
