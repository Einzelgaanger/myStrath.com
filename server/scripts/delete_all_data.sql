-- Delete all tables and all data in them
-- This script will completely reset the database by dropping all tables and sequences

-- Drop all existing tables
DROP TABLE IF EXISTS class_instances CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS content CASCADE;

-- Drop all sequences
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.tablename) || '_id_seq CASCADE';
    END LOOP;
END $$;

-- Verify that all tables have been dropped
DO $$
DECLARE
    table_count INTEGER;
    r RECORD;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM pg_tables
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'Number of tables remaining: %', table_count;
    
    IF table_count > 0 THEN
        RAISE NOTICE 'Tables remaining:';
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            RAISE NOTICE '%', r.tablename;
        END LOOP;
    END IF;
END $$; 