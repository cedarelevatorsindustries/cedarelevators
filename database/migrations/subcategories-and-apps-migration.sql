-- Subcategories and Application Mappings Migration
-- Creates subcategories for all 15 main categories and maps categories to applications

-- ============================================
-- PART 1: CREATE SUBCATEGORIES
-- ============================================

-- 1. Guide Shoes & Liners Subcategories
INSERT INTO categories (id, name, slug, parent_id, description) VALUES
('sub-0001-0001', 'Polyurethane Guide Shoes', 'polyurethane-guide-shoes', 'c0000001-0000-0000-0000-000000000001', 'Durable polyurethane guide shoes for smooth operation'),
('sub-0001-0002', 'Nylon Guide Liners', 'nylon-guide-liners', 'c0000001-0000-0000-0000-000000000001', 'Low-friction nylon liners for guide rails'),
('sub-0001-0003', 'Adjustable Guide Shoes', 'adjustable-guide-shoes', 'c0000001-0000-0000-0000-000000000001', 'Adjustable guide shoes for precise alignment'),
('sub-0001-0004', 'Heavy-Duty Guide Rollers', 'heavy-duty-guide-rollers', 'c0000001-0000-0000-0000-000000000001', 'Reinforced guide rollers for heavy loads');

-- 2. Rollers & Bearings Subcategories
INSERT INTO categories (id, name, slug, parent_id, description) VALUES
('sub-0002-0001', 'Guide Rollers', 'guide-rollers', 'c0000001-0000-0000-0000-000000000002', 'Precision guide rollers for car guidance'),
('sub-0002-0002', 'Door Rollers', 'door-rollers', 'c0000001-0000-0000-0000-000000000002', 'Smooth-running door rollers'),
('sub-0002-0003', 'Chain Rollers', 'chain-rollers', 'c0000001-0000-0000-0000-000000000002', 'Heavy-duty chain rollers'),
('sub-0002-0004', 'Bearing Blocks', 'bearing-blocks', 'c0000001-0000-0000-0000-000000000002', 'Precision bearing block assemblies');

-- 3. Door Components Subcategories
INSERT INTO categories (id, name, slug, parent_id, description) VALUES
('sub-0003-0001', 'Door Locks & Latches', 'door-locks-latches', 'c0000001-0000-0000-0000-000000000003', 'Safety locks and latches for elevator doors'),
('sub-0003-0002', 'Door Hangers & Tracks', 'door-hangers-tracks', 'c0000001-0000-0000-0000-000000000003', 'Door suspension and track systems'),
('sub-0003-0003', 'Door Motors & Operators', 'door-motors-operators', 'c0000001-0000-0000-0000-000000000003', 'Automatic door drive systems'),
('sub-0003-0004', 'Safety Edges', 'safety-edges', 'c0000001-0000-0000-0000-000000000003', 'Door safety edge sensors');

-- 4. Switches & Sensors Subcategories
INSERT INTO categories (id, name, slug, parent_id, description) VALUES
('sub-0004-0001', 'Limit Switches', 'limit-switches', 'c0000001-0000-0000-0000-000000000004', 'Position limit switches'),
('sub-0004-0002', 'Proximity Sensors', 'proximity-sensors', 'c0000001-0000-0000-0000-000000000004', 'Non-contact proximity detection'),
('sub-0004-0003', 'Micro Switches', 'micro-switches', 'c0000001-0000-0000-0000-000000000004', 'Precision micro switches'),
('sub-0004-0004', 'Photocells', 'photocells', 'c0000001-0000-0000-0000-000000000004', 'Optical door sensors');

-- 5. Bushings & Dampers Subcategories
INSERT INTO categories (id, name, slug, parent_id, description) VALUES
('sub-0005-0001', 'Rubber Bushings', 'rubber-bushings', 'c0000001-0000-0000-0000-000000000005', 'Vibration isolation bushings'),
('sub-0005-0002', 'Vibration Dampers', 'vibration-dampers', 'c0000001-0000-0000-0000-000000000005', 'Active vibration damping systems'),
('sub-0005-0003', 'Buffer Springs', 'buffer-springs', 'c0000001-0000-0000-0000-000000000005', 'Impact absorbing buffer springs'),
('sub-0005-0004', 'Shock Absorbers', 'shock-absorbers', 'c0000001-0000-0000-0000-000000000005', 'Hydraulic shock absorption units');

-- 6. Rope & Cable Components Subcategories
INSERT INTO categories (id, name, slug, parent_id, description) VALUES
('sub-0006-0001', 'Steel Wire Ropes', 'steel-wire-ropes', 'c0000001-0000-0000-0000-000000000006', 'High-strength suspension ropes'),
('sub-0006-0002', 'Cable Anchors', 'cable-anchors', 'c0000001-0000-0000-0000-000000000006', 'Rope termination anchors'),
('sub-0006-0003', 'Cable Clamps', 'cable-clamps', 'c0000001-0000-0000-0000-000000000006', 'Wire rope fastening clamps'),
('sub-0006-0004', 'Traveling Cables', 'traveling-cables', 'c0000001-0000-0000-0000-000000000006', 'Flexible traveling cable assemblies');

-- 7. Control Panels & Displays Subcategories
INSERT INTO categories (id, name, slug, parent_id, description) VALUES
('sub-0007-0001', 'COP Panels', 'cop-panels', 'c0000001-0000-0000-0000-000000000007', 'Car Operating Panels'),
('sub-0007-0002', 'LOP Panels', 'lop-panels', 'c0000001-0000-0000-0000-000000000007', 'Landing Operating Panels'),
('sub-0007-0003', 'LED Displays', 'led-displays', 'c0000001-0000-0000-0000-000000000007', 'Floor position LED displays'),
('sub-0007-0004', 'PCB Boards', 'pcb-boards', 'c0000001-0000-0000-0000-000000000007', 'Control circuit boards');

-- 8. Safety Equipment Subcategories
INSERT INTO categories (id, name, slug, parent_id, description) VALUES
('sub-0008-0001', 'Safety Brakes', 'safety-brakes', 'c0000001-0000-0000-0000-000000000008', 'Emergency braking systems'),
('sub-0008-0002', 'Governors', 'governors', 'c0000001-0000-0000-0000-000000000008', 'Overspeed governors'),
('sub-0008-0003', 'ARD Units', 'ard-units', 'c0000001-0000-0000-0000-000000000008', 'Anti-Reversal Devices'),
('sub-0008-0004', 'Emergency Alarms', 'emergency-alarms', 'c0000001-0000-0000-0000-000000000008', 'Emergency communication systems');

-- 9. Inspection & Junction Boxes Subcategories
INSERT INTO categories (id, name, slug, parent_id, description) VALUES
('sub-0009-0001', 'Inspection Boxes', 'inspection-boxes', 'c0000001-0000-0000-0000-000000000009', 'Maintenance inspection boxes'),
('sub-0009-0002', 'Junction Boxes', 'junction-boxes', 'c0000001-0000-0000-0000-000000000009', 'Electrical junction boxes'),
('sub-0009-0003', 'Terminal Boxes', 'terminal-boxes', 'c0000001-0000-0000-0000-000000000009', 'Wiring terminal boxes'),
('sub-0009-0004', 'Control Boxes', 'control-boxes', 'c0000001-0000-0000-0000-000000000009', 'Control system enclosures');

-- 10. Brackets & Clips Subcategories
INSERT INTO categories (id, name, slug, parent_id, description) VALUES
('sub-0010-0001', 'Guide Rail Brackets', 'guide-rail-brackets', 'c0000001-0000-0000-0000-000000000010', 'Guide rail mounting brackets'),
('sub-0010-0002', 'Cable Clips', 'cable-clips', 'c0000001-0000-0000-0000-000000000010', 'Cable routing clips'),
('sub-0010-0003', 'Mounting Brackets', 'mounting-brackets', 'c0000001-0000-0000-0000-000000000010', 'Universal mounting brackets'),
('sub-0010-0004', 'Bulldog Clips', 'bulldog-clips', 'c0000001-0000-0000-0000-000000000010', 'Wire rope clips');

-- 11. Fixings & Hardware Subcategories  
INSERT INTO categories (id, name, slug, parent_id, description) VALUES
('sub-0011-0001', 'Bolts & Nuts', 'bolts-nuts', 'c0000001-0000-0000-0000-000000000011', 'Standard bolts and nuts'),
('sub-0011-0002', 'Screws & Washers', 'screws-washers', 'c0000001-0000-0000-0000-000000000011', 'Screws and washer sets'),
('sub-0011-0003', 'Pins & Rivets', 'pins-rivets', 'c0000001-0000-0000-0000-000000000011', 'Fastening pins and rivets'),
('sub-0011-0004', 'Anchor Bolts', 'anchor-bolts', 'c0000001-0000-0000-0000-000000000011', 'Heavy-duty anchor bolts');

-- 12. Electrical Components Subcategories
INSERT INTO categories (id, name, slug, parent_id, description) VALUES
('sub-0012-0001', 'Relays & Contactors', 'relays-contactors', 'c0000001-0000-0000-0000-000000000012', 'Electrical switching relays'),
('sub-0012-0002', 'Motors', 'motors', 'c0000001-0000-0000-0000-000000000012', 'Elevator drive motors'),
('sub-0012-0003', 'Transformers', 'transformers', 'c0000001-0000-0000-0000-000000000012', 'Power transformers'),
('sub-0012-0004', 'Inverters & Drives', 'inverters-drives', 'c0000001-0000-0000-0000-000000000012', 'Variable frequency drives');

-- 13. Ventilation & Accessories Subcategories
INSERT INTO categories (id, name, slug, parent_id, description) VALUES
('sub-0013-0001', 'Exhaust Fans', 'exhaust-fans', 'c0000001-0000-0000-0000-000000000013', 'Car ventilation fans'),
('sub-0013-0002', 'Ventilation Grills', 'ventilation-grills', 'c0000001-0000-0000-0000-000000000013', 'Air circulation grills'),
('sub-0013-0003', 'Air Filters', 'air-filters', 'c0000001-0000-0000-0000-000000000013', 'Cabin air filters'),
('sub-0013-0004', 'Blower Units', 'blower-units', 'c0000001-0000-0000-0000-000000000013', 'Forced air blowers');

-- 14. Johnson Type Components Subcategories
INSERT INTO categories (id, name, slug, parent_id, description) VALUES
('sub-0014-0001', 'Johnson Doors', 'johnson-doors', 'c0000001-0000-0000-0000-000000000014', 'Johnson brand doors'),
('sub-0014-0002', 'Johnson Operators', 'johnson-operators', 'c0000001-0000-0000-0000-000000000014', 'Johnson door operators'),
('sub-0014-0003', 'Johnson Controls', 'johnson-controls', 'c0000001-0000-0000-0000-000000000014', 'Johnson control systems'),
('sub-0014-0004', 'Johnson Accessories', 'johnson-accessories', 'c0000001-0000-0000-0000-000000000014', 'Johnson spare parts');

-- 15. Oil System Components Subcategories
INSERT INTO categories (id, name, slug, parent_id, description) VALUES
('sub-0015-0001', 'Hydraulic Oil', 'hydraulic-oil', 'c0000001-0000-0000-0000-000000000015', 'Elevator hydraulic fluids'),
('sub-0015-0002', 'Oil Pumps', 'oil-pumps', 'c0000001-0000-0000-0000-000000000015', 'Hydraulic oil pumps'),
('sub-0015-0003', 'Hydraulic Cylinders', 'hydraulic-cylinders', 'c0000001-0000-0000-0000-000000000015', 'Lifting cylinders'),
('sub-0015-0004', 'Control Valves', 'control-valves', 'c0000001-0000-0000-0000-000000000015', 'Hydraulic control valves');

-- ============================================
-- PART 2: CREATE APPLICATION-CATEGORY MAPPINGS
-- ============================================

-- ERECTION (New Installation) - a0000001-0000-0000-0000-000000000001
INSERT INTO application_categories (application_id, category_id, sort_order) VALUES
('a0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 1), -- Guide Shoes & Liners
('a0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000002', 2), -- Rollers & Bearings
('a0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000006', 3), -- Rope & Cable Components
('a0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000007', 4), -- Control Panels & Displays
('a0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000008', 5), -- Safety Equipment
('a0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000010', 6), -- Brackets & Clips
('a0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000011', 7), -- Fixings & Hardware
('a0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000012', 8); -- Electrical Components

-- SERVICE (Maintenance & Repair) - a0000001-0000-0000-0000-000000000002
INSERT INTO application_categories (application_id, category_id, sort_order) VALUES
('a0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000003', 1), -- Door Components
('a0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000004', 2), -- Switches & Sensors
('a0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000005', 3), -- Bushings & Dampers
('a0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000008', 4), -- Safety Equipment
('a0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000009', 5), -- Inspection & Junction Boxes
('a0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000013', 6), -- Ventilation & Accessories
('a0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000015', 7); -- Oil System Components

-- MODERNIZATION (Upgrades) - a0000001-0000-0000-0000-000000000003
INSERT INTO application_categories (application_id, category_id, sort_order) VALUES
('a0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000007', 1), -- Control Panels & Displays
('a0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000003', 2), -- Door Components
('a0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000012', 3), -- Electrical Components
('a0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000014', 4), -- Johnson Type Components
('a0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000008', 5); -- Safety Equipment

-- TESTING (Quality Control) - a0000001-0000-0000-0000-000000000004
INSERT INTO application_categories (application_id, category_id, sort_order) VALUES
('a0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000004', 1), -- Switches & Sensors
('a0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000008', 2), -- Safety Equipment
('a0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000009', 3), -- Inspection & Junction Boxes
('a0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000007', 4); -- Control Panels & Displays
