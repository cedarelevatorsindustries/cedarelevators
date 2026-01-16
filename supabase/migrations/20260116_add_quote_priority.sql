-- Add priority column to quotes table
-- Priority levels: low (guest), normal (individual), medium (business unverified), high (business verified)

ALTER TABLE quotes 
ADD COLUMN priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'medium', 'high'));

-- Create index for better query performance when filtering/sorting by priority
CREATE INDEX idx_quotes_priority ON quotes(priority);

-- Update existing quotes based on account_type
UPDATE quotes
SET priority = CASE 
    WHEN account_type = 'guest' THEN 'low'
    WHEN account_type = 'individual' THEN 'normal'
    WHEN account_type = 'business' THEN 
        CASE 
            WHEN user_id IN (
                SELECT id FROM users 
                WHERE user_type = 'business' 
                AND verification_status = 'verified'
            ) THEN 'high'
            ELSE 'medium'
        END
    ELSE 'normal'
END
WHERE priority = 'normal'; -- Only update rows that haven't been explicitly set

-- Add comment for documentation
COMMENT ON COLUMN quotes.priority IS 'Quote priority for admin triaging: low (guest), normal (individual), medium (business unverified), high (business verified)';
