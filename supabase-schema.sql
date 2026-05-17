-- ============================================================
-- Olympe – Supabase Schema
-- Run this in Supabase > SQL Editor > New Query
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
  id            TEXT PRIMARY KEY,
  pseudo        TEXT NOT NULL UNIQUE,
  password      TEXT NOT NULL,
  is_admin      BOOLEAN   DEFAULT FALSE,
  faction       TEXT      DEFAULT 'olympe',
  avatar        TEXT,
  custom_id     TEXT,
  parrain       JSONB,
  perms         TEXT[]    DEFAULT '{}',
  abonnement    TEXT,
  whitelist     TEXT[]    DEFAULT '{}',
  onesignal_id  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table (DMs + group messages)
CREATE TABLE IF NOT EXISTS public.messages (
  id                  TEXT PRIMARY KEY,
  from_id             TEXT NOT NULL,
  from_pseudo         TEXT NOT NULL,
  to_id               TEXT,
  to_pseudo           TEXT,
  content             TEXT,
  date                TIMESTAMPTZ DEFAULT NOW(),
  read                BOOLEAN   DEFAULT FALSE,
  read_by             TEXT[]    DEFAULT '{}',
  attachments         JSONB     DEFAULT '[]',
  is_group            BOOLEAN   DEFAULT FALSE,
  group_id            TEXT,
  participant_ids     TEXT[],
  participant_pseudos TEXT[],
  group_name          TEXT
);

-- Disable RLS (custom auth managed in app)
ALTER TABLE public.users    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- Enable Realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
