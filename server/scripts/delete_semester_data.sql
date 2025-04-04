-- Delete all data for a specific semester for a specific year for a specific course for a specific program for a specific university for a specific country
-- This script demonstrates how to delete all class instances for a specific semester

-- Example: Delete all data for Semester One, Year 2 Electrical Engineering course in Diploma program at University of Nairobi in Kenya
DELETE FROM class_instances
WHERE country = 'Kenya' 
  AND university = 'University of Nairobi'
  AND program = 'Diploma'
  AND course = 'Electrical Engineering'
  AND year = 2
  AND semester = 'One';

-- Verify the deletion
DO $$
DECLARE
    semester_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO semester_count
    FROM class_instances
    WHERE country = 'Kenya' 
      AND university = 'University of Nairobi'
      AND program = 'Diploma'
      AND course = 'Electrical Engineering'
      AND year = 2
      AND semester = 'One';
    
    RAISE NOTICE 'Number of class instances remaining for Semester One, Year 2 Electrical Engineering course in Diploma program at University of Nairobi in Kenya: %', semester_count;
    
    IF semester_count > 0 THEN
        RAISE NOTICE 'Class instances remaining for Semester One, Year 2 Electrical Engineering course in Diploma program at University of Nairobi in Kenya:';
        FOR r IN (SELECT id, group_name 
                 FROM class_instances 
                 WHERE country = 'Kenya' 
                   AND university = 'University of Nairobi'
                   AND program = 'Diploma'
                   AND course = 'Electrical Engineering'
                   AND year = 2
                   AND semester = 'One') LOOP
            RAISE NOTICE 'ID: %, Group: %', 
                r.id, r.group_name;
        END LOOP;
    END IF;
END $$;

-- Example: Delete all data for Semester Two, Year 3 Computer Science course in Bachelor's Degree program at University of Lagos in Nigeria
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'Nigeria' 
  AND university = 'University of Lagos (UNILAG)'
  AND program = 'Bachelor''s Degree'
  AND course = 'Computer Science'
  AND year = 3
  AND semester = 'Two';
*/

-- Example: Delete all data for Spring Semester, Year 1 Financial Economics course in Master's Degree program at University of Cape Town in South Africa
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'South Africa' 
  AND university = 'University of Cape Town (UCT)'
  AND program = 'Master''s Degree'
  AND course = 'Financial Economics'
  AND year = 1
  AND semester = 'Spring';
*/

-- Example: Delete all data for Fall Semester, Year 4 Statistics and Data Science course in Doctorate (PhD) program at Cairo University in Egypt
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'Egypt' 
  AND university = 'Cairo University'
  AND program = 'Doctorate (PhD)'
  AND course = 'Statistics and Data Science'
  AND year = 4
  AND semester = 'Fall';
*/

-- Example: Delete all data for Semester Two, Year 1 Public Health course in Postgraduate Diploma program at KNUST in Ghana
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'Ghana' 
  AND university = 'Kwame Nkrumah University of Science and Technology (KNUST)'
  AND program = 'Postgraduate Diploma'
  AND course = 'Public Health'
  AND year = 1
  AND semester = 'Two';
*/ 