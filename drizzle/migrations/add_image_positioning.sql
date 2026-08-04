-- Migration: Add image positioning fields to creators table
-- Created: 2026-08-04

ALTER TABLE creators
ADD COLUMN IF NOT EXISTS image_pos_x INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS image_pos_y INTEGER DEFAULT 20;

-- Update existing records to use default positioning
UPDATE creators
SET image_pos_x = 50, image_pos_y = 20
WHERE image_pos_x IS NULL OR image_pos_y IS NULL;
