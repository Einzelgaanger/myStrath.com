-- Delete all data for a specific country
-- This script demonstrates how to delete all class instances for a specific country

-- Example: Delete all data for Kenya
DELETE FROM class_instances
WHERE country = 'Kenya';

-- Verify the deletion
DO $$
DECLARE
    kenya_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO kenya_count
    FROM class_instances
    WHERE country = 'Kenya';
    
    RAISE NOTICE 'Number of class instances remaining for Kenya: %', kenya_count;
    
    IF kenya_count > 0 THEN
        RAISE NOTICE 'Class instances remaining for Kenya:';
        FOR r IN (SELECT id, university, program, course, year, semester, group_name 
                 FROM class_instances 
                 WHERE country = 'Kenya') LOOP
            RAISE NOTICE 'ID: %, University: %, Program: %, Course: %, Year: %, Semester: %, Group: %', 
                r.id, r.university, r.program, r.course, r.year, r.semester, r.group_name;
        END LOOP;
    END IF;
END $$;

-- Example: Delete all data for Nigeria
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'Nigeria';
*/

-- Example: Delete all data for South Africa
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'South Africa';
*/

-- Example: Delete all data for Egypt
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'Egypt';
*/

-- Example: Delete all data for Ghana
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'Ghana';
*/ 