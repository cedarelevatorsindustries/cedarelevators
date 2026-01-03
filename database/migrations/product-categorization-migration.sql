-- ================================================
-- Product Categorization Migration
-- ================================================
-- Purpose: Bulk assign categories, applications, and elevator types to all products
-- Date: January 3, 2026
-- Products to categorize: 247
-- 
-- This migration uses keyword matching to intelligently categorize products
-- ================================================

BEGIN;

-- ================================================
-- STEP 1: ASSIGN CATEGORIES
-- ================================================

-- Guide Shoes & Liners (category_id: c0000001-0000-0000-0000-000000000001)
UPDATE products 
SET category_id = 'c0000001-0000-0000-0000-000000000001'
WHERE status = 'active' 
AND category_id IS NULL
AND (
    name ILIKE '%guide%shoe%'
    OR name ILIKE '%guide%liner%'
    OR name ILIKE '%guide%rail%'
);

-- Rollers & Bearings (category_id: c0000001-0000-0000-0000-000000000002)
UPDATE products 
SET category_id = 'c0000001-0000-0000-0000-000000000002'
WHERE status = 'active' 
AND category_id IS NULL
AND (
    name ILIKE '%roller%'
    OR name ILIKE '%bearing%'
    OR name ILIKE '%pulley%'
    OR name ILIKE '%sheave%'
);

-- Door Components (category_id: c0000001-0000-0000-0000-000000000003)
UPDATE products 
SET category_id = 'c0000001-0000-0000-0000-000000000003'
WHERE status = 'active' 
AND category_id IS NULL
AND (
    name ILIKE '%door%'
    OR name ILIKE '%lock%'
    OR name ILIKE '%latch%'
    OR name ILIKE '%hanger%'
    OR name ILIKE '%sliding%'
);

-- Switches & Sensors (category_id: c0000001-0000-0000-0000-000000000004)
UPDATE products 
SET category_id = 'c0000001-0000-0000-0000-000000000004'
WHERE status = 'active' 
AND category_id IS NULL
AND (
    name ILIKE '%switch%'
    OR name ILIKE '%sensor%'
    OR name ILIKE '%proximity%'
    OR name ILIKE '%limit%'
    OR name ILIKE '%micro%switch%'
    OR name ILIKE '%photocell%'
    OR name ILIKE '%detector%'
);

-- Bushings & Dampers (category_id: c0000001-0000-0000-0000-000000000005)
UPDATE products 
SET category_id = 'c0000001-0000-0000-0000-000000000005'
WHERE status = 'active' 
AND category_id IS NULL
AND (
    name ILIKE '%bushing%'
    OR name ILIKE '%damper%'
    OR name ILIKE '%rubber%pad%'
    OR name ILIKE '%vibration%'
    OR name ILIKE '%buffer%spring%'
);

-- Rope & Cable Components (category_id: c0000001-0000-0000-0000-000000000006)
UPDATE products 
SET category_id = 'c0000001-0000-0000-0000-000000000006'
WHERE status = 'active' 
AND category_id IS NULL
AND (
    name ILIKE '%cable%'
    OR name ILIKE '%wire%'
    OR name ILIKE '%rope%'
    OR name ILIKE '%cord%'
    OR name ILIKE '%cable%anchor%'
    OR name ILIKE '%core%cable%'
);

-- Control Panels & Displays (category_id: c0000001-0000-0000-0000-000000000007)
UPDATE products 
SET category_id = 'c0000001-0000-0000-0000-000000000007'
WHERE status = 'active' 
AND category_id IS NULL
AND (
    name ILIKE '%display%'
    OR name ILIKE '%panel%'
    OR name ILIKE '%button%'
    OR name ILIKE '%COP%'
    OR name ILIKE '%LOP%'
    OR name ILIKE '%segment%display%'
    OR name ILIKE '%indicator%'
    OR name ILIKE '%PCB%'
    OR name ILIKE '%board%'
);

-- Safety Equipment (category_id: c0000001-0000-0000-0000-000000000008)
UPDATE products 
SET category_id = 'c0000001-0000-0000-0000-000000000008'
WHERE status = 'active' 
AND category_id IS NULL
AND (
    name ILIKE '%safety%'
    OR name ILIKE '%brake%'
    OR name ILIKE '%governor%'
    OR name ILIKE '%ARD%'
    OR name ILIKE '%emergency%'
    OR name ILIKE '%alarm%'
);

-- Inspection & Junction Boxes (category_id: c0000001-0000-0000-0000-000000000009)
UPDATE products 
SET category_id = 'c0000001-0000-0000-0000-000000000009'
WHERE status = 'active' 
AND category_id IS NULL
AND (
    name ILIKE '%box%'
    OR name ILIKE '%junction%'
    OR name ILIKE '%inspection%'
    OR name ILIKE '%enclosure%'
);

-- Brackets & Clips (category_id: c0000001-0000-0000-0000-000000000010)
UPDATE products 
SET category_id = 'c0000001-0000-0000-0000-000000000010'
WHERE status = 'active' 
AND category_id IS NULL
AND (
    name ILIKE '%bracket%'
    OR name ILIKE '%clip%'
    OR name ILIKE '%clamp%'
    OR name ILIKE '%holder%'
    OR name ILIKE '%mount%'
    OR name ILIKE '%bulldog%clip%'
);

-- Fixings & Hardware (category_id: c0000001-0000-0000-0000-000000000011)
UPDATE products 
SET category_id = 'c0000001-0000-0000-0000-000000000011'
WHERE status = 'active' 
AND category_id IS NULL
AND (
    name ILIKE '%bolt%'
    OR name ILIKE '%nut%'
    OR name ILIKE '%screw%'
    OR name ILIKE '%washer%'
    OR name ILIKE '%fastener%'
    OR name ILIKE '%pin%'
    OR name ILIKE '%rivet%'
);

-- Electrical Components (category_id: c0000001-0000-0000-0000-000000000012)
UPDATE products 
SET category_id = 'c0000001-0000-0000-0000-000000000012'
WHERE status = 'active' 
AND category_id IS NULL
AND (
    name ILIKE '%relay%'
    OR name ILIKE '%contactor%'
    OR name ILIKE '%transformer%'
    OR name ILIKE '%fuse%'
    OR name ILIKE '%terminal%'
    OR name ILIKE '%connector%'
    OR name ILIKE '%power%supply%'
    OR name ILIKE '%inverter%'
    OR name ILIKE '%motor%'
    OR name ILIKE '%coil%'
    OR name ILIKE '%battery%'
);

-- Ventilation & Accessories (category_id: c0000001-0000-0000-0000-000000000013)
UPDATE products 
SET category_id = 'c0000001-0000-0000-0000-000000000013'
WHERE status = 'active' 
AND category_id IS NULL
AND (
    name ILIKE '%fan%'
    OR name ILIKE '%blower%'
    OR name ILIKE '%ventilator%'
    OR name ILIKE '%grill%'
    OR name ILIKE '%vent%'
    OR name ILIKE '%filter%'
);

-- Johnson Type Components (category_id: c0000001-0000-0000-0000-000000000014)
UPDATE products 
SET category_id = 'c0000001-0000-0000-0000-000000000014'
WHERE status = 'active' 
AND category_id IS NULL
AND (
    name ILIKE '%johnson%'
);

-- Oil System Components (category_id: c0000001-0000-0000-0000-000000000015)
UPDATE products 
SET category_id = 'c0000001-0000-0000-0000-000000000015'
WHERE status = 'active' 
AND category_id IS NULL
AND (
    name ILIKE '%oil%'
    OR name ILIKE '%hydraulic%'
    OR name ILIKE '%pump%'
    OR name ILIKE '%cylinder%'
    OR name ILIKE '%valve%'
);

-- Default: Assign remaining products to most general category (Electrical Components)
UPDATE products 
SET category_id = 'c0000001-0000-0000-0000-000000000012'
WHERE status = 'active' 
AND category_id IS NULL;

-- ================================================
-- STEP 2: ASSIGN APPLICATIONS
-- ================================================
-- All elevator components can be used across all applications
-- We'll use smart defaults based on component types

-- Erection (new installation) - Core structural & installation components
UPDATE products 
SET application_id = 'a0000001-0000-0000-0000-000000000001'
WHERE status = 'active' 
AND application_id IS NULL
AND (
    category_id IN (
        'c0000001-0000-0000-0000-000000000001', -- Guide Shoes
        'c0000001-0000-0000-0000-000000000003', -- Door Components
        'c0000001-0000-0000-0000-000000000006', -- Rope & Cable
        'c0000001-0000-0000-0000-000000000007', -- Control Panels
        'c0000001-0000-0000-0000-000000000008', -- Safety Equipment
        'c0000001-0000-0000-0000-000000000010', -- Brackets & Clips
        'c0000001-0000-0000-0000-000000000011', -- Fixings
        'c0000001-0000-0000-0000-000000000015'  -- Oil System
    )
);

-- Service/Maintenance - Wear parts & replaceable components
UPDATE products 
SET application_id = 'a0000001-0000-0000-0000-000000000002'
WHERE status = 'active' 
AND application_id IS NULL
AND (
    category_id IN (
        'c0000001-0000-0000-0000-000000000002', -- Rollers & Bearings
        'c0000001-0000-0000-0000-000000000004', -- Switches & Sensors
        'c0000001-0000-0000-0000-000000000005', -- Bushings & Dampers
        'c0000001-0000-0000-0000-000000000009', -- Inspection Boxes
        'c0000001-0000-0000-0000-000000000012', -- Electrical Components
        'c0000001-0000-0000-0000-000000000013', -- Ventilation
        'c0000001-0000-0000-0000-000000000014'  -- Johnson Type
    )
);

-- Modernization - Already assigned in Erection
-- Testing - Assign remaining to testing (inspection/quality assurance)
UPDATE products 
SET application_id = 'a0000001-0000-0000-0000-000000000004'
WHERE status = 'active' 
AND application_id IS NULL;

-- ================================================
-- STEP 3: ASSIGN ELEVATOR TYPES (Junction Table)
-- ================================================
-- Most components are universal and can be used across multiple elevator types
-- We'll link products to elevator types based on common usage patterns

-- Home Lifts - All categories (home lifts use all component types)
INSERT INTO product_elevator_types (product_id, elevator_type_id)
SELECT p.id, '4b9b1b7a-a15e-4cda-b220-84d242ee6032'
FROM products p
WHERE p.status = 'active'
ON CONFLICT DO NOTHING;

-- Residential Lifts - All categories
INSERT INTO product_elevator_types (product_id, elevator_type_id)
SELECT p.id, 'e39469b3-fb5c-448f-8cf0-492174ff9e1d'
FROM products p
WHERE p.status = 'active'
ON CONFLICT DO NOTHING;

-- Commercial Elevators - All categories (commercial is universal)
INSERT INTO product_elevator_types (product_id, elevator_type_id)
SELECT p.id, 'ce3fd196-0747-4637-b6e3-59e9b66ebea4'
FROM products p
WHERE p.status = 'active'
ON CONFLICT DO NOTHING;

-- Hospital Lifts - Priority to safety, control,  door components
INSERT INTO product_elevator_types (product_id, elevator_type_id)
SELECT p.id, 'a9d197d1-bfb2-4878-be43-d23b38ea2a31'
FROM products p
WHERE p.status = 'active'
AND p.category_id IN (
    'c0000001-0000-0000-0000-000000000003', -- Door Components
    'c0000001-0000-0000-0000-000000000004', -- Switches & Sensors
    'c0000001-0000-0000-0000-000000000007', -- Control Panels
    'c0000001-0000-0000-0000-000000000008', -- Safety Equipment
    'c0000001-0000-0000-0000-000000000012'  -- Electrical Components
)
ON CONFLICT DO NOTHING;

-- Goods Lifts - Heavy duty components
INSERT INTO product_elevator_types (product_id, elevator_type_id)
SELECT p.id, 'cd56e995-bbe4-4bdd-803d-2eee8e7d704c'
FROM products p
WHERE p.status = 'active'
AND p.category_id IN (
    'c0000001-0000-0000-0000-000000000002', -- Rollers & Bearings
    'c0000001-0000-0000-0000-000000000005', -- Bushings & Dampers
    'c0000001-0000-0000-0000-000000000006', -- Rope & Cable
    'c0000001-0000-0000-0000-000000000008', -- Safety Equipment
    'c0000001-0000-0000-0000-000000000011', -- Fixings
    'c0000001-0000-0000-0000-000000000012'  -- Electrical Components
)
ON CONFLICT DO NOTHING;

-- Hydraulic Lifts - Oil system, hydraulic components, control panels
INSERT INTO product_elevator_types (product_id, elevator_type_id)
SELECT p.id, '41e42d9b-058c-4354-9ce5-0c01527a3e95'
FROM products p
WHERE p.status = 'active'
AND p.category_id IN (
    'c0000001-0000-0000-0000-000000000004', -- Switches & Sensors
    'c0000001-0000-0000-0000-000000000007', -- Control Panels
    'c0000001-0000-0000-0000-000000000008', -- Safety Equipment
    'c0000001-0000-0000-0000-000000000012', -- Electrical Components
    'c0000001-0000-0000-0000-000000000015'  -- Oil System Components
)
ON CONFLICT DO NOTHING;

-- ================================================
-- VERIFICATION QUERIES
-- ================================================
-- Run these after migration to verify results

-- Check category distribution
-- SELECT 
--     c.name as category,
--     COUNT(p.id) as product_count
-- FROM categories c
-- LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
-- WHERE c.parent_id IS NULL
-- GROUP BY c.id, c.name
-- ORDER BY product_count DESC;

-- Check application distribution
-- SELECT 
--     a.title as application,
--     COUNT(p.id) as product_count
-- FROM applications a
-- LEFT JOIN products p ON a.id = p.application_id AND p.status = 'active'
-- GROUP BY a.id, a.title
-- ORDER BY product_count DESC;

-- Check elevator type links
-- SELECT 
--     et.name as elevator_type,
--     COUNT(DISTINCT pet.product_id) as product_count
-- FROM elevator_types et
-- LEFT JOIN product_elevator_types pet ON et.id = pet.elevator_type_id
-- LEFT JOIN products p ON pet.product_id = p.id AND p.status = 'active'
-- WHERE et.is_active = true
-- GROUP BY et.id, et.name
-- ORDER BY product_count DESC;

-- Check products without any categorization
-- SELECT COUNT(*) as uncategorized_count
-- FROM products
-- WHERE status = 'active'
-- AND (category_id IS NULL OR application_id IS NULL);

COMMIT;

-- ================================================
-- MIGRATION SUMMARY
-- ================================================
-- This migration will:
-- 1. Assign ALL 247 products to appropriate categories based on keywords
-- 2. Assign ALL products to either Erection, Service, or Testing applications
-- 3. Create elevator type links (products can belong to multiple types)
-- 4. Ensure no product is left uncategorized
-- ================================================
