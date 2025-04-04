-- Delete all data for a specific student of a specific group for a specific semester for a specific year for a specific course for a specific program for a specific university for a specific country
-- This script demonstrates how to delete a specific student from a class instance

-- Example: Delete student with admission number "2023001" from Group A, Semester One, Year 2 Electrical Engineering course in Diploma program at University of Nairobi in Kenya
UPDATE class_instances
SET students = (
    SELECT jsonb_agg(student)
    FROM jsonb_array_elements(students) student
    WHERE (student->>'admission') != '2023001'
)
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
    student_exists BOOLEAN;
    student_count INTEGER;
BEGIN
    -- Check if the student still exists in the specified class
    SELECT EXISTS (
        SELECT 1
        FROM class_instances,
             jsonb_array_elements(students) student
        WHERE country = 'Kenya' 
          AND university = 'University of Nairobi'
          AND program = 'Diploma'
          AND course = 'Electrical Engineering'
          AND year = 2
          AND semester = 'One'
          AND group_name = 'A'
          AND (student->>'admission') = '2023001'
    ) INTO student_exists;
    
    -- Get the total number of students in the class
    SELECT COALESCE(json_array_length(students::json), 0)
    INTO student_count
    FROM class_instances
    WHERE country = 'Kenya' 
      AND university = 'University of Nairobi'
      AND program = 'Diploma'
      AND course = 'Electrical Engineering'
      AND year = 2
      AND semester = 'One'
      AND group_name = 'A';
    
    RAISE NOTICE 'Student with admission number 2023001 exists in class: %', student_exists;
    RAISE NOTICE 'Number of students remaining in class: %', student_count;
    
    IF student_count > 0 THEN
        RAISE NOTICE 'Remaining students in class:';
        FOR r IN (
            SELECT student->>'admission' as admission,
                   student->>'name' as name
            FROM class_instances,
                 jsonb_array_elements(students) student
            WHERE country = 'Kenya' 
              AND university = 'University of Nairobi'
              AND program = 'Diploma'
              AND course = 'Electrical Engineering'
              AND year = 2
              AND semester = 'One'
              AND group_name = 'A'
        ) LOOP
            RAISE NOTICE 'Admission: %, Name: %', r.admission, r.name;
        END LOOP;
    END IF;
END $$;

-- Example: Delete student with admission number "2021001" from Group B, Semester Two, Year 3 Computer Science course in Bachelor's Degree program at University of Lagos in Nigeria
-- Uncomment to use
/*
UPDATE class_instances
SET students = (
    SELECT jsonb_agg(student)
    FROM jsonb_array_elements(students) student
    WHERE (student->>'admission') != '2021001'
)
WHERE country = 'Nigeria' 
  AND university = 'University of Lagos (UNILAG)'
  AND program = 'Bachelor''s Degree'
  AND course = 'Computer Science'
  AND year = 3
  AND semester = 'Two'
  AND group_name = 'B';
*/

-- Example: Delete student with admission number "2022001" from Group Alpha, Spring Semester, Year 1 Financial Economics course in Master's Degree program at University of Cape Town in South Africa
-- Uncomment to use
/*
UPDATE class_instances
SET students = (
    SELECT jsonb_agg(student)
    FROM jsonb_array_elements(students) student
    WHERE (student->>'admission') != '2022001'
)
WHERE country = 'South Africa' 
  AND university = 'University of Cape Town (UCT)'
  AND program = 'Master''s Degree'
  AND course = 'Financial Economics'
  AND year = 1
  AND semester = 'Spring'
  AND group_name = 'Alpha';
*/

-- Example: Delete student with admission number "2024001" from Research Group 1, Fall Semester, Year 4 Statistics and Data Science course in Doctorate (PhD) program at Cairo University in Egypt
-- Uncomment to use
/*
UPDATE class_instances
SET students = (
    SELECT jsonb_agg(student)
    FROM jsonb_array_elements(students) student
    WHERE (student->>'admission') != '2024001'
)
WHERE country = 'Egypt' 
  AND university = 'Cairo University'
  AND program = 'Doctorate (PhD)'
  AND course = 'Statistics and Data Science'
  AND year = 4
  AND semester = 'Fall'
  AND group_name = 'Research Group 1';
*/

-- Example: Delete student with admission number "2025001" from Group C, Semester Two, Year 1 Public Health course in Postgraduate Diploma program at KNUST in Ghana
-- Uncomment to use
/*
UPDATE class_instances
SET students = (
    SELECT jsonb_agg(student)
    FROM jsonb_array_elements(students) student
    WHERE (student->>'admission') != '2025001'
)
WHERE country = 'Ghana' 
  AND university = 'Kwame Nkrumah University of Science and Technology (KNUST)'
  AND program = 'Postgraduate Diploma'
  AND course = 'Public Health'
  AND year = 1
  AND semester = 'Two'
  AND group_name = 'C';
*/ 