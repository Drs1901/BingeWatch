-- =====================================================
-- Complete Supabase Schema for Movie Streaming App
-- =====================================================
-- Run this entire file in your Supabase SQL Editor

-- =====================================================
-- 1. PROFILES TABLE AND AUTHENTICATION SETUP
-- =====================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create a secure function to handle new user profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 2. COMMENTS AND REACTIONS SYSTEM
-- =====================================================

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  media_id text NOT NULL,
  likes integer DEFAULT 0,
  dislikes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comment reactions table
CREATE TABLE IF NOT EXISTS comment_reactions (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, comment_id)
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON comments
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Comment reactions policies
CREATE POLICY "Comment reactions are viewable by everyone"
  ON comment_reactions
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert reactions"
  ON comment_reactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reactions"
  ON comment_reactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON comment_reactions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. WATCHLIST AND WATCH HISTORY TABLES
-- =====================================================

-- Create watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  media_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, media_type, media_id)
);

-- Create watch history table
CREATE TABLE IF NOT EXISTS watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  media_type text NOT NULL CHECK (media_type IN ('movie', 'tv')),
  media_id text NOT NULL,
  watched_at timestamptz DEFAULT now(),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  season_number integer,
  episode_number integer,
  episode_name text,
  UNIQUE(user_id, media_type, media_id)
);

-- Enable RLS
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- Watchlist policies
CREATE POLICY "Users can view their own watchlist"
  ON watchlist
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their watchlist"
  ON watchlist
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their watchlist"
  ON watchlist
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Watch history policies
CREATE POLICY "Users can view their own watch history"
  ON watch_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their watch history"
  ON watch_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their watch history"
  ON watch_history
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- =====================================================
-- 4. INDEXES AND FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Add index for faster comment retrieval
CREATE INDEX IF NOT EXISTS comments_media_idx ON comments (media_type, media_id);

-- Add index for reactions
CREATE INDEX IF NOT EXISTS comment_reactions_user_idx ON comment_reactions (user_id);
CREATE INDEX IF NOT EXISTS comment_reactions_comment_idx ON comment_reactions (comment_id);

-- Add foreign key reference to profiles
ALTER TABLE comments
ADD CONSTRAINT comments_user_profile_fkey
FOREIGN KEY (user_id) REFERENCES profiles(id)
ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS watchlist_user_idx ON watchlist (user_id);
CREATE INDEX IF NOT EXISTS watchlist_media_idx ON watchlist (media_type, media_id);
CREATE INDEX IF NOT EXISTS watch_history_user_idx ON watch_history (user_id);
CREATE INDEX IF NOT EXISTS watch_history_media_idx ON watch_history (media_type, media_id);
CREATE INDEX IF NOT EXISTS watch_history_watched_at_idx ON watch_history (watched_at DESC);
CREATE INDEX IF NOT EXISTS watch_history_episode_idx 
ON watch_history (media_type, media_id, season_number, episode_number);

-- =====================================================
-- 5. FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update comment likes/dislikes count
CREATE OR REPLACE FUNCTION update_comment_reaction_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.reaction_type = 'like' THEN
      UPDATE comments SET likes = COALESCE(likes, 0) + 1 WHERE id = NEW.comment_id;
    ELSE
      UPDATE comments SET dislikes = COALESCE(dislikes, 0) + 1 WHERE id = NEW.comment_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction_type = 'like' THEN
      UPDATE comments SET likes = GREATEST(COALESCE(likes, 0) - 1, 0) WHERE id = OLD.comment_id;
    ELSE
      UPDATE comments SET dislikes = GREATEST(COALESCE(dislikes, 0) - 1, 0) WHERE id = OLD.comment_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' AND OLD.reaction_type != NEW.reaction_type THEN
    IF OLD.reaction_type = 'like' THEN
      UPDATE comments 
      SET likes = GREATEST(COALESCE(likes, 0) - 1, 0),
          dislikes = COALESCE(dislikes, 0) + 1 
      WHERE id = NEW.comment_id;
    ELSE
      UPDATE comments 
      SET likes = COALESCE(likes, 0) + 1,
          dislikes = GREATEST(COALESCE(dislikes, 0) - 1, 0)
      WHERE id = NEW.comment_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updating comment reaction counts
DROP TRIGGER IF EXISTS on_reaction_change ON comment_reactions;
CREATE TRIGGER on_reaction_change
  AFTER INSERT OR UPDATE OR DELETE ON comment_reactions
  FOR EACH ROW
  EXECUTE FUNCTION update_comment_reaction_count();

-- Create function to update watch history
CREATE OR REPLACE FUNCTION update_watch_history(
  p_user_id uuid,
  p_media_type text,
  p_media_id text,
  p_season_number integer DEFAULT NULL,
  p_episode_number integer DEFAULT NULL,
  p_episode_name text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO watch_history (
    user_id,
    media_type,
    media_id,
    season_number,
    episode_number,
    episode_name,
    watched_at
  )
  VALUES (
    p_user_id,
    p_media_type,
    p_media_id,
    p_season_number,
    p_episode_number,
    p_episode_name,
    now()
  )
  ON CONFLICT (user_id, media_type, media_id)
  DO UPDATE SET
    season_number = EXCLUDED.season_number,
    episode_number = EXCLUDED.episode_number,
    episode_name = EXCLUDED.episode_name,
    watched_at = EXCLUDED.watched_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SCHEMA SETUP COMPLETE
-- =====================================================
-- This schema includes:
-- - User profiles with automatic creation
-- - Comments system with like/dislike functionality
-- - Watchlist for saving movies/shows
-- - Watch history with episode tracking
-- - All necessary RLS policies for security
-- - Performance indexes
-- - Helper functions and triggers
-- =====================================================