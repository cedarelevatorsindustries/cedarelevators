-- Migration: Add uniqueness constraints for name-based CSV import
-- Purpose: Prevent ambiguous name resolution by ensuring names are unique per entity type
-- Version: 2 (Name-Based Import Support)
-- Date: 2026-01-05

-- =============================================
-- UNIQUE INDEXES (Case-Insensitive)
-- =============================================

-- 1. Applications - Ensure unique names
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_unique_title 
ON applications (LOWER(title));

-- 2. Categories - Ensure unique names
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_unique_title 
ON categories (LOWER(title));

-- 3. Subcategories - Ensure unique names
CREATE UNIQUE INDEX IF NOT EXISTS idx_subcategories_unique_title 
ON subcategories (LOWER(title));

-- 4. Elevator Types - Ensure unique names
CREATE UNIQUE INDEX IF NOT EXISTS idx_elevator_types_unique_name 
ON elevator_types (LOWER(name));

-- 5. Collections - Ensure unique names
CREATE UNIQUE INDEX IF NOT EXISTS idx_collections_unique_name 
ON collections (LOWER(name));

-- =============================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- =============================================

-- These indexes help with lookups (non-unique, just for performance)
CREATE INDEX IF NOT EXISTS idx_applications_lower_title 
ON applications (LOWER(title));

CREATE INDEX IF NOT EXISTS idx_categories_lower_title 
ON categories (LOWER(title));

CREATE INDEX IF NOT EXISTS idx_subcategories_lower_title 
ON subcategories (LOWER(title));

CREATE INDEX IF NOT EXISTS idx_elevator_types_lower_name 
ON elevator_types (LOWER(name));

CREATE INDEX IF NOT EXISTS idx_collections_lower_name 
ON collections (LOWER(name));

-- =============================================
-- VALIDATION CHECK
-- =============================================

-- Check for existing duplicates
DO $$
DECLARE
    dup_applications INTEGER;
    dup_categories INTEGER;
    dup_subcategories INTEGER;
    dup_types INTEGER;
    dup_collections INTEGER;
BEGIN
    -- Check applications
    SELECT COUNT(*) INTO dup_applications
    FROM (
        SELECT LOWER(title), COUNT(*) as cnt
        FROM applications
        GROUP BY LOWER(title)
        HAVING COUNT(*) > 1
    ) dups;
    
    -- Check categories
    SELECT COUNT(*) INTO dup_categories
    FROM (
        SELECT LOWER(title), COUNT(*) as cnt
        FROM categories
        GROUP BY LOWER(title)
        HAVING COUNT(*) > 1
    ) dups;
    
    -- Check subcategories
    SELECT COUNT(*) INTO dup_subcategories
    FROM (
        SELECT LOWER(title), COUNT(*) as cnt
        FROM subcategories
        GROUP BY LOWER(title)
        HAVING COUNT(*) > 1
    ) dups;
    
    -- Check elevator types
    SELECT COUNT(*) INTO dup_types
    FROM (
        SELECT LOWER(name), COUNT(*) as cnt
        FROM elevator_types
        GROUP BY LOWER(name)
        HAVING COUNT(*) > 1
    ) dups;
    
    -- Check collections
    SELECT COUNT(*) INTO dup_collections
    FROM (
        SELECT LOWER(name), COUNT(*) as cnt
        FROM collections
        GROUP BY LOWER(name)
        HAVING COUNT(*) > 1
    ) dups;
    
    -- Report results
    RAISE NOTICE '=== Duplicate Check Results ===';
    RAISE NOTICE 'Applications: % duplicates', dup_applications;
    RAISE NOTICE 'Categories: % duplicates', dup_categories;
    RAISE NOTICE 'Subcategories: % duplicates', dup_subcategories;
    RAISE NOTICE 'Elevator Types: % duplicates', dup_types;
    RAISE NOTICE 'Collections: % duplicates', dup_collections;
    
    IF (dup_applications + dup_categories + dup_subcategories + dup_types + dup_collections) = 0 THEN
        RAISE NOTICE 'All unique indexes created successfully - no duplicates found!';
    END IF;
END $$;
