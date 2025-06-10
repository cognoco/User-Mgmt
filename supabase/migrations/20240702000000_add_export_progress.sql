-- Migration: add progress and checksum tracking for data exports

ALTER TABLE user_data_exports
  ADD COLUMN IF NOT EXISTS progress INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS checksum TEXT;

ALTER TABLE company_data_exports
  ADD COLUMN IF NOT EXISTS progress INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS checksum TEXT;
