-- Delete all data for a specific course for a specific program for a specific university for a specific country
-- This script demonstrates how to delete all class instances for a specific course

-- Example: Delete all data for Electrical Engineering course in Diploma program at University of Nairobi in Kenya
DELETE FROM class_instances
WHERE country = 'Kenya' 
  AND university = 'University of Nairobi'
  AND program = 'Diploma'
  AND course = 'Electrical Engineering';

-- Verify the deletion
DO $$
DECLARE
    course_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO course_count
    FROM class_instances
    WHERE country = 'Kenya' 
      AND university = 'University of Nairobi'
      AND program = 'Diploma'
      AND course = 'Electrical Engineering';
    
    RAISE NOTICE 'Number of class instances remaining for Electrical Engineering course in Diploma program at University of Nairobi in Kenya: %', course_count;
    
    IF course_count > 0 THEN
        RAISE NOTICE 'Class instances remaining for Electrical Engineering course in Diploma program at University of Nairobi in Kenya:';
        FOR r IN (SELECT id, year, semester, group_name 
                 FROM class_instances 
                 WHERE country = 'Kenya' 
                   AND university = 'University of Nairobi'
                   AND program = 'Diploma'
                   AND course = 'Electrical Engineering') LOOP
            RAISE NOTICE 'ID: %, Year: %, Semester: %, Group: %', 
                r.id, r.year, r.semester, r.group_name;
        END LOOP;
    END IF;
END $$;

-- Example: Delete all data for Computer Science course in Bachelor's Degree program at University of Lagos in Nigeria
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'Nigeria' 
  AND university = 'University of Lagos (UNILAG)'
  AND program = 'Bachelor''s Degree'
  AND course = 'Computer Science';
*/

-- Example: Delete all data for Financial Economics course in Master's Degree program at University of Cape Town in South Africa
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'South Africa' 
  AND university = 'University of Cape Town (UCT)'
  AND program = 'Master''s Degree'
  AND course = 'Financial Economics';
*/

-- Example: Delete all data for Statistics and Data Science course in Doctorate (PhD) program at Cairo University in Egypt
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'Egypt' 
  AND university = 'Cairo University'
  AND program = 'Doctorate (PhD)'
  AND course = 'Statistics and Data Science';
*/

-- Example: Delete all data for Public Health course in Postgraduate Diploma program at KNUST in Ghana
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'Ghana' 
  AND university = 'Kwame Nkrumah University of Science and Technology (KNUST)'
  AND program = 'Postgraduate Diploma'
  AND course = 'Public Health';
*/ 