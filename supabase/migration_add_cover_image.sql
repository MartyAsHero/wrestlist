-- Run this in Supabase SQL Editor if you've already run schema.sql before.
-- (If you're setting up fresh, this column is already included in schema.sql.)

alter table entries add column if not exists cover_image_url text;
