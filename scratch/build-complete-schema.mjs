import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function extractData(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const outer = JSON.parse(content);
  const tagMatch = outer.result.match(/<untrusted-data-([a-f0-9-]+)>/);
  if (!tagMatch) throw new Error('Could not find tag in ' + filePath);
  const tag = tagMatch[1];
  const firstTag = '<untrusted-data-' + tag + '>';
  const secondIdx = outer.result.indexOf(firstTag, outer.result.indexOf(firstTag) + 1);
  const endTag = '</untrusted-data-' + tag + '>';
  const endIdx = outer.result.indexOf(endTag);
  const jsonStr = outer.result.slice(secondIdx + firstTag.length, endIdx).trim();
  return JSON.parse(jsonStr);
}

const baseDir = 'C:/Users/manikandan/.gemini/antigravity/brain/07104594-f5c2-499b-8c4f-a5cfb47e7956/.system_generated/steps';

const columns = extractData(path.join(baseDir, '982/output.txt'));
const constraints = extractData(path.join(baseDir, '984/output.txt'));
const indexes = extractData(path.join(baseDir, '986/output.txt'));
const functions = extractData(path.join(baseDir, '988/output.txt'));
const triggers = extractData(path.join(baseDir, '990/output.txt'));
const policies = extractData(path.join(baseDir, '992/output.txt'));

let sql = `-- =============================================================================
-- CEDAR ELEVATORS - COMPLETE NATIVE POSTGRESQL SCHEMA DDL DUMP
-- Project: hbkdbrxzqaraarivudej (cedar elevators industries ecommerce)
-- PostgreSQL Engine: 17.11 (ap-south-1 Mumbai)
-- Generated: ${new Date().toISOString()}
-- Target Schema: public
-- Includes: Extensions, Enums, Sequences, Tables, Constraints, Indexes,
--           Functions (69), Triggers (50), and Row Level Security Policies (203)
-- =============================================================================

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- -----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA extensions;

-- -----------------------------------------------------------------------------
-- 2. CUSTOM ENUMS
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE public.admin_role AS ENUM ('super_admin', 'admin', 'manager', 'staff');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.collection_display_type AS ENUM ('normal', 'special');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.policy_status AS ENUM ('draft', 'published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.policy_type AS ENUM ('privacy_policy', 'terms_of_service', 'return_policy', 'shipping_policy', 'refund_policy', 'warranty_policy', 'custom');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.quote_status AS ENUM ('draft', 'pending', 'reviewing', 'approved', 'rejected', 'converted', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -----------------------------------------------------------------------------
-- 3. CUSTOM SEQUENCES
-- -----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS public.order_number_seq
    START WITH 1000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE IF NOT EXISTS public.quote_number_seq
    START WITH 1000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- -----------------------------------------------------------------------------
-- 4. TABLES & COLUMNS
-- -----------------------------------------------------------------------------
`;

// Group columns by table
const tables = {};
columns.forEach(col => {
  if (!tables[col.table_name]) tables[col.table_name] = [];
  tables[col.table_name].push(col);
});

// Group constraints by table (split into primary keys/checks vs foreign keys)
const tableConstraints = {};
const foreignKeys = [];

constraints.forEach(con => {
  const tblName = con.table_name.replace(/^public\./, '').replace(/^"|"$/g, '');
  if (!tableConstraints[tblName]) tableConstraints[tblName] = [];
  
  if (con.constraint_def.startsWith('FOREIGN KEY')) {
    foreignKeys.push({ table: tblName, name: con.constraint_name, def: con.constraint_def });
  } else {
    tableConstraints[tblName].push(con);
  }
});

for (const [tableName, cols] of Object.entries(tables)) {
  sql += `\n-- Table: public.${tableName}\n`;
  sql += `CREATE TABLE IF NOT EXISTS public."${tableName}" (\n`;

  const colDefs = cols.map(c => {
    let type = c.data_type === 'USER-DEFINED' ? `public.${c.udt_name}` : c.data_type;
    if (type === 'ARRAY') type = `${c.udt_name.replace(/^_/, '')}[]`;
    let def = `    "${c.column_name}" ${type}`;
    if (c.column_default) def += ` DEFAULT ${c.column_default}`;
    if (c.is_nullable === 'NO') def += ' NOT NULL';
    return def;
  });

  const cons = tableConstraints[tableName] || [];
  cons.forEach(con => {
    colDefs.push(`    CONSTRAINT "${con.constraint_name}" ${con.constraint_def}`);
  });

  sql += colDefs.join(',\n');
  sql += `\n);\n`;
}

sql += `\n-- -----------------------------------------------------------------------------
-- 5. FOREIGN KEY CONSTRAINTS
-- -----------------------------------------------------------------------------
`;

foreignKeys.forEach(fk => {
  sql += `ALTER TABLE ONLY public."${fk.table}"\n    ADD CONSTRAINT "${fk.name}" ${fk.def};\n`;
});

sql += `\n-- -----------------------------------------------------------------------------
-- 6. INDEXES
-- -----------------------------------------------------------------------------
`;

indexes.forEach(idx => {
  sql += `${idx.index_def};\n`;
});

sql += `\n-- -----------------------------------------------------------------------------
-- 7. FUNCTIONS & PROCEDURES (${functions.length} Functions)
-- -----------------------------------------------------------------------------
`;

functions.forEach(fn => {
  sql += `\n-- Function: ${fn.function_name}\n`;
  sql += `${fn.function_def};\n`;
});

sql += `\n-- -----------------------------------------------------------------------------
-- 8. TRIGGERS (${triggers.length} Triggers)
-- -----------------------------------------------------------------------------
`;

triggers.forEach(trg => {
  sql += `${trg.trigger_def};\n`;
});

sql += `\n-- -----------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY POLICIES (${policies.length} Policies)
-- -----------------------------------------------------------------------------
`;

for (const tableName of Object.keys(tables)) {
  sql += `ALTER TABLE public."${tableName}" ENABLE ROW LEVEL SECURITY;\n`;
}

sql += `\n`;
policies.forEach(pol => {
  sql += `${pol.policy_def}\n`;
});

const localSchemaPath = 'd:/web development/cedarelevators/backups/cedar_complete_schema.sql';
const extSchemaPath = 'C:/Users/manikandan/.gemini/antigravity/brain/07104594-f5c2-499b-8c4f-a5cfb47e7956/backups/cedar_complete_schema.sql';

fs.writeFileSync(localSchemaPath, sql);
fs.writeFileSync(extSchemaPath, sql);

const hashSum = crypto.createHash('sha256');
hashSum.update(fs.readFileSync(localSchemaPath));
const sha256 = hashSum.digest('hex');

console.log(`[SCHEMA DDL ENGINE] Success!`);
console.log(`Saved: ${localSchemaPath}`);
console.log(`Size: ${fs.statSync(localSchemaPath).size} bytes`);
console.log(`SHA-256: ${sha256}`);
