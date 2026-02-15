-- =============================================
-- Seed Initial Data
-- =============================================
-- This migration adds the initial accounts and default local calendar

-- Insert initial accounts
INSERT INTO accounts (id, name, type, balance, color, logo) VALUES
(
    'a1c7e8b4-3f2a-4d1e-9b5c-8f6e2a1d3c4b',
    'KBZ Banking',
    'Bank',
    0.00,
    'bg-blue-600',
    'https://logo.clearbit.com/kbzbank.com'
),
(
    'b2d8f9c5-4a3b-5e2f-ac6d-9a7f3b2e4d5c',
    'Hand Cash',
    'Cash',
    0.00,
    'bg-green-500',
    NULL
),
(
    'c3e9aad6-5b4c-6f3a-bd7e-ab8a4c3f5e6d',
    'KPay',
    'Mobile Money',
    0.00,
    'bg-blue-500',
    'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/aa/62/73/aa627375-db66-b25c-6020-0082a623126f/AppIcon-0-0-1x_U007emarketing-0-5-0-85-220.png/512x512bb.jpg'
);

-- Insert default local calendar
INSERT INTO external_calendars (id, summary, background_color, selected, is_primary, provider) VALUES
(
    'local-1',
    'My Personal Calendar',
    '#3b82f6',
    true,
    true,
    'local'
);
