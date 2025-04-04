-- Delete all data for a specific university in a specific country
-- This script demonstrates how to delete all class instances for a specific university in a specific country

-- Example: Delete all data for University of Nairobi in Kenya
DELETE FROM class_instances
WHERE country = 'Kenya' AND university = 'University of Nairobi';

-- Verify the deletion
DO $$
DECLARE
    uni_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO uni_count
    FROM class_instances
    WHERE country = 'Kenya' AND university = 'University of Nairobi';
    
    RAISE NOTICE 'Number of class instances remaining for University of Nairobi in Kenya: %', uni_count;
    
    IF uni_count > 0 THEN
        RAISE NOTICE 'Class instances remaining for University of Nairobi in Kenya:';
        FOR r IN (SELECT id, program, course, year, semester, group_name 
                 FROM class_instances 
                 WHERE country = 'Kenya' AND university = 'University of Nairobi') LOOP
            RAISE NOTICE 'ID: %, Program: %, Course: %, Year: %, Semester: %, Group: %', 
                r.id, r.program, r.course, r.year, r.semester, r.group_name;
        END LOOP;
    END IF;
END $$;

-- Example: Delete all data for University of Lagos in Nigeria
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'Nigeria' AND university = 'University of Lagos (UNILAG)';
*/

-- Example: Delete all data for University of Cape Town in South Africa
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'South Africa' AND university = 'University of Cape Town (UCT)';
*/

-- Example: Delete all data for Cairo University in Egypt
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'Egypt' AND university = 'Cairo University';
*/

-- Example: Delete all data for KNUST in Ghana
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'Ghana' AND university = 'Kwame Nkrumah University of Science and Technology (KNUST)';
*/ 