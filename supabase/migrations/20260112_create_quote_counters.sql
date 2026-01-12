-- Create quote_counters table for transaction-safe daily sequences
-- Format: CED-QT-{TYPE}-{YYMMDD}-{SEQ}
-- Example: CED-QT-BZ-260112-000123

CREATE TABLE IF NOT EXISTS quote_counters (
    date DATE NOT NULL,
    user_type TEXT NOT NULL,
    last_number INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (date, user_type)
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_quote_counters_date ON quote_counters(date);

-- Add helpful comment
COMMENT ON TABLE quote_counters IS 'Daily sequence counters for quote number generation, grouped by user type (GS=Guest, IN=Individual, BZ=Business, BV=Verified)';

-- Create function for atomic counter increment
CREATE OR REPLACE FUNCTION increment_quote_counter(
    p_date DATE,
    p_user_type TEXT
) RETURNS INTEGER AS $$
DECLARE
    v_counter INTEGER;
BEGIN
    -- Try to insert new counter for this date+type if doesn't exist
    INSERT INTO quote_counters (date, user_type, last_number)
    VALUES (p_date, p_user_type, 1)
    ON CONFLICT (date, user_type) DO NOTHING;
    
    -- Lock row and increment counter (prevents race conditions)
    UPDATE quote_counters
    SET last_number = last_number + 1,
        updated_at = NOW()
    WHERE date = p_date AND user_type = p_user_type
    RETURNING last_number INTO v_counter;
    
    RETURN v_counter;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_quote_counter IS 'Atomically increments and returns the next quote sequence number for a given date and user type';
