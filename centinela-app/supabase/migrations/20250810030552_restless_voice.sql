/*
  # Fix comments to profiles relationship

  1. Schema Changes
    - Ensure comments.user_id column exists (uuid type)
    - Backfill user_id from existing data if needed
    - Clean orphaned references
    - Create index for performance
    - Add foreign key constraint comments.user_id → profiles.id

  2. Security
    - Ensure RLS policies allow SELECT on comments and profiles
    - Maintain existing security model

  3. Data Safety
    - No data deletion
    - NULL user_id for comments without valid profile reference
    - Preserve existing comment data
*/

-- Start transaction
BEGIN;

-- 1) Create user_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.comments ADD COLUMN user_id uuid;
    RAISE NOTICE 'Added user_id column to comments table';
  ELSE
    RAISE NOTICE 'user_id column already exists in comments table';
  END IF;
END$$;

-- 2) Backfill: if there's an author_id or similar column, try to copy it
DO $$
BEGIN
  -- Check if there are any columns that might contain user references
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'comments' AND column_name = 'author_id'
  ) THEN
    -- Try to backfill from author_id if it's uuid compatible
    BEGIN
      UPDATE public.comments
      SET user_id = NULLIF(author_id::text, '')::uuid
      WHERE user_id IS NULL AND author_id IS NOT NULL;
      RAISE NOTICE 'Backfilled user_id from author_id';
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Could not backfill from author_id (type incompatible): %', SQLERRM;
    END;
  END IF;
END$$;

-- 3) Clean orphaned references - set user_id to NULL for non-existent profiles
UPDATE public.comments c
SET user_id = NULL
WHERE user_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = c.user_id
  );

-- 4) Create index for performance
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- 5) Create foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'comments_user_id_profiles_fkey'
  ) THEN
    ALTER TABLE public.comments
    ADD CONSTRAINT comments_user_id_profiles_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.profiles(id)
    ON DELETE CASCADE;
    RAISE NOTICE 'Created foreign key constraint comments_user_id_profiles_fkey';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists';
  END IF;
END$$;

-- 6) Ensure RLS policies allow reading (adjust to your security model)
DO $$
BEGIN
  -- Enable RLS on comments if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'comments' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on comments table';
  END IF;

  -- Enable RLS on profiles if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'profiles' AND c.relrowsecurity = true
  ) THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'Enabled RLS on profiles table';
  END IF;

  -- Ensure there's a policy to read comments (if none exists)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'comments' AND cmd = 'SELECT'
  ) THEN
    CREATE POLICY "Anyone can view non-hidden comments" ON public.comments
    FOR SELECT USING (NOT is_hidden);
    RAISE NOTICE 'Created SELECT policy for comments';
  END IF;

  -- Ensure there's a policy to read profiles (if none exists)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND cmd = 'SELECT'
  ) THEN
    CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);
    RAISE NOTICE 'Created SELECT policy for profiles';
  END IF;
END$$;

COMMIT;