-- Reemplazar emoji_id por player_slug en users
ALTER TABLE users RENAME COLUMN emoji_id TO player_slug;
