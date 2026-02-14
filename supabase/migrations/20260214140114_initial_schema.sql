-- =============================================
-- FinanceFlow Database Schema
-- =============================================
-- This migration creates all necessary tables for the FinanceFlow app
-- with proper relationships, constraints, and Row Level Security

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. ACCOUNTS TABLE
-- =============================================
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Bank', 'Cash', 'Mobile Money', 'Credit Card')),
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
    color TEXT NOT NULL,
    logo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. TRANSACTIONS TABLE
-- =============================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('Income', 'Expense')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL,
    date TEXT NOT NULL, -- ISO date string for consistency with frontend
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_date ON transactions(date);

-- =============================================
-- 3. PERSONAL LOGS TABLE
-- =============================================
CREATE TABLE personal_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL UNIQUE, -- One log per day
    water_intake INTEGER NOT NULL DEFAULT 0, -- cups
    exercise_minutes INTEGER NOT NULL DEFAULT 0,
    buddhist_time_minutes INTEGER NOT NULL DEFAULT 0,
    sleep_hours NUMERIC(4, 2) NOT NULL DEFAULT 0,
    study_minutes INTEGER NOT NULL DEFAULT 0,
    screen_time_minutes INTEGER NOT NULL DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for date queries
CREATE INDEX idx_personal_logs_date ON personal_logs(date);

-- =============================================
-- 4. CALENDAR EVENTS TABLE
-- =============================================
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    start_time TEXT NOT NULL, -- ISO date string
    end_time TEXT NOT NULL, -- ISO date string
    type TEXT NOT NULL CHECK (type IN ('local', 'team')), -- Only local/team events are stored
    color TEXT,
    description TEXT,
    location TEXT,
    calendar_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for time-based queries
CREATE INDEX idx_calendar_events_start ON calendar_events(start_time);

-- =============================================
-- 5. EXTERNAL CALENDARS TABLE
-- =============================================
CREATE TABLE external_calendars (
    id TEXT PRIMARY KEY, -- Use external calendar ID
    summary TEXT NOT NULL, -- Calendar name
    background_color TEXT,
    selected BOOLEAN NOT NULL DEFAULT true,
    is_primary BOOLEAN DEFAULT false,
    provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft', 'local', 'team')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personal_logs_updated_at BEFORE UPDATE ON personal_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_external_calendars_updated_at BEFORE UPDATE ON external_calendars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
-- For single-user MVP: Allow all operations
-- For multi-user: Will need to add user_id columns and auth policies

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_calendars ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (single-user mode)
-- These can be updated later for multi-user with auth
CREATE POLICY "Allow all operations on accounts" ON accounts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on personal_logs" ON personal_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on calendar_events" ON calendar_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on external_calendars" ON external_calendars FOR ALL USING (true) WITH CHECK (true);
