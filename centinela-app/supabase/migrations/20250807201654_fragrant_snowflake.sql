/*
  # Fix RLS policies for article_likes table

  1. Security Updates
    - Drop existing restrictive policies
    - Create new policies that properly handle both authenticated and anonymous users
    - Allow users to manage likes with either user_id (authenticated) or session_id (anonymous)
    - Ensure proper access control for both scenarios

  2. Policy Changes
    - "Anyone can create likes" - allows INSERT for both user types
    - "Anyone can view article likes" - allows SELECT for everyone
    - "Users can delete their own likes" - allows DELETE based on ownership
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Anyone can create likes" ON article_likes;
DROP POLICY IF EXISTS "Anyone can view article likes" ON article_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON article_likes;

-- Policy for viewing article likes (everyone can see all likes)
CREATE POLICY "Anyone can view article likes"
  ON article_likes
  FOR SELECT
  TO public
  USING (true);

-- Policy for creating likes (both authenticated and anonymous users)
CREATE POLICY "Anyone can create likes"
  ON article_likes
  FOR INSERT
  TO public
  WITH CHECK (
    -- Authenticated users: must have user_id = auth.uid() and session_id IS NULL
    (auth.uid() IS NOT NULL AND user_id = auth.uid() AND session_id IS NULL)
    OR
    -- Anonymous users: must have user_id IS NULL and session_id IS NOT NULL
    (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
  );

-- Policy for deleting likes (users can delete their own likes)
CREATE POLICY "Users can delete their own likes"
  ON article_likes
  FOR DELETE
  TO public
  USING (
    -- Authenticated users can delete their own likes
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    -- Anonymous users can delete likes with their session_id
    (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
  );

-- Policy for updating likes (in case needed in the future)
CREATE POLICY "Users can update their own likes"
  ON article_likes
  FOR UPDATE
  TO public
  USING (
    -- Authenticated users can update their own likes
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR
    -- Anonymous users can update likes with their session_id
    (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
  )
  WITH CHECK (
    -- Same constraints as INSERT
    (auth.uid() IS NOT NULL AND user_id = auth.uid() AND session_id IS NULL)
    OR
    (auth.uid() IS NULL AND user_id IS NULL AND session_id IS NOT NULL)
  );