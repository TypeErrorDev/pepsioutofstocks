-- Migration: add missing sales_alerts resolution/status fields
-- Run this against your Supabase/Postgres database to align the schema

ALTER TABLE sales_alerts
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS resolution_text TEXT,
  ADD COLUMN IF NOT EXISTS resolved_by TEXT,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP WITH TIME ZONE;
