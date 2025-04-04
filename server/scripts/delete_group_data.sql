-- Delete all data for a specific group for a specific semester for a specific year for a specific course for a specific program for a specific university for a specific country
-- This script demonstrates how to delete all class instances for a specific group

-- Example: Delete all data for Group A, Semester One, Year 2 Electrical Engineering course in Diploma program at University of Nairobi in Kenya
DELETE FROM class_instances
WHERE country = 'Kenya' 
  AND university = 'University of Nairobi'
  AND program = 'Diploma'
  AND course = 'Electrical Engineering'
  AND year = 2
  AND semester = 'One'
  AND group_name = 'A';

-- Verify the deletion
DO $$
DECLARE
    group_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO group_count
    FROM class_instances
    WHERE country = 'Kenya' 
      AND university = 'University of Nairobi'
      AND program = 'Diploma'
      AND course = 'Electrical Engineering'
      AND year = 2
      AND semester = 'One'
      AND group_name = 'A';
    
    RAISE NOTICE 'Number of class instances remaining for Group A, Semester One, Year 2 Electrical Engineering course in Diploma program at University of Nairobi in Kenya: %', group_count;
    
    IF group_count > 0 THEN
        RAISE NOTICE 'Class instances remaining for Group A, Semester One, Year 2 Electrical Engineering course in Diploma program at University of Nairobi in Kenya:';
        FOR r IN (SELECT id, admin_name, students 
                 FROM class_instances 
                 WHERE country = 'Kenya' 
                   AND university = 'University of Nairobi'
                   AND program = 'Diploma'
                   AND course = 'Electrical Engineering'
                   AND year = 2
                   AND semester = 'One'
                   AND group_name = 'A') LOOP
            RAISE NOTICE 'ID: %, Admin: %, Number of Students: %', 
                r.id, r.admin_name, json_array_length(r.students::json);
        END LOOP;
    END IF;
END $$;

-- Example: Delete all data for Group B, Semester Two, Year 3 Computer Science course in Bachelor's Degree program at University of Lagos in Nigeria
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'Nigeria' 
  AND university = 'University of Lagos (UNILAG)'
  AND program = 'Bachelor''s Degree'
  AND course = 'Computer Science'
  AND year = 3
  AND semester = 'Two'
  AND group_name = 'B';
*/

-- Example: Delete all data for Group Alpha, Spring Semester, Year 1 Financial Economics course in Master's Degree program at University of Cape Town in South Africa
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'South Africa' 
  AND university = 'University of Cape Town (UCT)'
  AND program = 'Master''s Degree'
  AND course = 'Financial Economics'
  AND year = 1
  AND semester = 'Spring'
  AND group_name = 'Alpha';
*/

-- Example: Delete all data for Research Group 1, Fall Semester, Year 4 Statistics and Data Science course in Doctorate (PhD) program at Cairo University in Egypt
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'Egypt' 
  AND university = 'Cairo University'
  AND program = 'Doctorate (PhD)'
  AND course = 'Statistics and Data Science'
  AND year = 4
  AND semester = 'Fall'
  AND group_name = 'Research Group 1';
*/

-- Example: Delete all data for Group C, Semester Two, Year 1 Public Health course in Postgraduate Diploma program at KNUST in Ghana
-- Uncomment to use
/*
DELETE FROM class_instances
WHERE country = 'Ghana' 
  AND university = 'Kwame Nkrumah University of Science and Technology (KNUST)'
  AND program = 'Postgraduate Diploma'
  AND course = 'Public Health'
  AND year = 1
  AND semester = 'Two'
  AND group_name = 'C';
*/ 