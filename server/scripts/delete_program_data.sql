-- Delete all data for a specific program for a specific university in a specific country
-- This script demonstrates how to delete all class instances for a specific program

-- Example: Delete all data for Diploma program at University of Nairobi in Kenya
DELETE FROM class_instances
WHERE country = 'Kenya' 
  AND university = 'University of Nairobi'
  AND program = 'Diploma';

-- Verify the deletion
DO $$
DECLARE
    program_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO program_count
    FROM class_instances
    WHERE country = 'Kenya' 
      AND university = 'University of Nairobi'
      AND program = 'Diploma';
    
    RAISE NOTICE 'Number of class instances remaining for Diploma program at University of Nairobi in Kenya: %', program_count;
    
    IF program_count > 0 THEN
        RAISE NOTICE 'Class instances remaining for Diploma program at University of Nairobi in Kenya:';
        FOR r IN (SELECT id, course, year, semester, group_name 
                 FROM class_instances 
                 WHERE country = 'Kenya' 
                   AND university = 'University of Nairobi'
                   AND program = 'Diploma') LOOP
            RAISE NOTICE 'ID: %, Course: %, Year: %, Semester: %, Group: %', 
                r.id, r.course, r.year, r.semester, r.group_name;
        END LOOP;
    END IF;
END $$;

-- Example: Delete all data for Bachelor's Degree program at University of Lagos in Nigeria
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'Nigeria' 
  AND university = 'University of Lagos (UNILAG)'
  AND program = 'Bachelor''s Degree';
*/

-- Example: Delete all data for Master's Degree program at University of Cape Town in South Africa
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'South Africa' 
  AND university = 'University of Cape Town (UCT)'
  AND program = 'Master''s Degree';
*/

-- Example: Delete all data for Doctorate (PhD) program at Cairo University in Egypt
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'Egypt' 
  AND university = 'Cairo University'
  AND program = 'Doctorate (PhD)';
*/

-- Example: Delete all data for Postgraduate Diploma program at KNUST in Ghana
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'Ghana' 
  AND university = 'Kwame Nkrumah University of Science and Technology (KNUST)'
  AND program = 'Postgraduate Diploma';
*/ 