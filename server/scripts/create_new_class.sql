-- Add a new class instance to the database
-- This script demonstrates how to create a new class instance with all required data

-- Example: Create a new class instance for Software Engineering at University of Nairobi
INSERT INTO class_instances (
    -- Class identification
    country,
    university,
    program,
    course,
    year,
    semester,
    group_name,
    
    -- Units
    units,
    
    -- Super Admin (using the same super admin as other classes)
    super_admin_name,
    super_admin_admission,
    super_admin_password,
    
    -- Class Admin
    admin_name,
    admin_admission,
    admin_password,
    
    -- Students
    students,
    
    -- Content
    content
) VALUES (
    -- Class identification
    'Kenya',
    'University of Nairobi',
    'Bachelor''s Degree',
    'Software Engineering',
    1,
    'One',
    'A',
    
    -- Units (array of unit names)
    ARRAY[
        'Programming Fundamentals',
        'Software Design',
        'Database Systems',
        'Web Development',
        'Mobile App Development',
        'Software Testing'
    ],
    
    -- Super Admin
    'Prof. Adebayo Ojo',
    '000000',
    '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', -- "stratizens#websuperadmin"
    
    -- Class Admin
    'Dr. James Mwangi',
    '000000',
    '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', -- "stratizens#webadmin"
    
    -- Students (JSONB array with student details)
    '[
        {
            "admission": "2024001",
            "name": "John Kamau",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        },
        {
            "admission": "2024002",
            "name": "Sarah Njeri",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        },
        {
            "admission": "2024003",
            "name": "Michael Omondi",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        },
        {
            "admission": "2024004",
            "name": "Lucy Wairimu",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        }
    ]'::jsonb,
    
    -- Content (JSONB array with course content)
    '[
        {
            "title": "Introduction to Programming",
            "description": "Learn programming basics with Python",
            "type": "video",
            "url": "https://example.com/video1",
            "unit": "Programming Fundamentals"
        },
        {
            "title": "Software Design Patterns",
            "description": "Learn common software design patterns",
            "type": "pdf",
            "url": "https://example.com/pdf1",
            "unit": "Software Design"
        },
        {
            "title": "Database Design Principles",
            "description": "Learn about database design and normalization",
            "type": "video",
            "url": "https://example.com/video2",
            "unit": "Database Systems"
        },
        {
            "title": "Modern Web Development",
            "description": "Learn React and Node.js",
            "type": "pdf",
            "url": "https://example.com/pdf2",
            "unit": "Web Development"
        },
        {
            "title": "Mobile App Development with Flutter",
            "description": "Learn cross-platform mobile development",
            "type": "video",
            "url": "https://example.com/video3",
            "unit": "Mobile App Development"
        },
        {
            "title": "Software Testing Methodologies",
            "description": "Learn about unit testing and integration testing",
            "type": "pdf",
            "url": "https://example.com/pdf3",
            "unit": "Software Testing"
        }
    ]'::jsonb
);

-- Verify the new class instance was created
DO $$
DECLARE
    class_exists BOOLEAN;
    student_count INTEGER;
    content_count INTEGER;
BEGIN
    -- Check if the class instance exists
    SELECT EXISTS (
        SELECT 1
        FROM class_instances
        WHERE country = 'Kenya'
          AND university = 'University of Nairobi'
          AND program = 'Bachelor''s Degree'
          AND course = 'Software Engineering'
          AND year = 1
          AND semester = 'One'
          AND group_name = 'A'
    ) INTO class_exists;
    
    -- Get the number of students
    SELECT COALESCE(json_array_length(students::json), 0)
    INTO student_count
    FROM class_instances
    WHERE country = 'Kenya'
      AND university = 'University of Nairobi'
      AND program = 'Bachelor''s Degree'
      AND course = 'Software Engineering'
      AND year = 1
      AND semester = 'One'
      AND group_name = 'A';
    
    -- Get the number of content items
    SELECT COALESCE(json_array_length(content::json), 0)
    INTO content_count
    FROM class_instances
    WHERE country = 'Kenya'
      AND university = 'University of Nairobi'
      AND program = 'Bachelor''s Degree'
      AND course = 'Software Engineering'
      AND year = 1
      AND semester = 'One'
      AND group_name = 'A';
    
    -- Display the results
    RAISE NOTICE 'Class instance exists: %', class_exists;
    RAISE NOTICE 'Number of students: %', student_count;
    RAISE NOTICE 'Number of content items: %', content_count;
    
    -- Display class details
    IF class_exists THEN
        RAISE NOTICE 'Class details:';
        FOR r IN (
            SELECT *
            FROM class_instances
            WHERE country = 'Kenya'
              AND university = 'University of Nairobi'
              AND program = 'Bachelor''s Degree'
              AND course = 'Software Engineering'
              AND year = 1
              AND semester = 'One'
              AND group_name = 'A'
        ) LOOP
            RAISE NOTICE 'ID: %, Admin: %, Units: %', 
                r.id, r.admin_name, array_to_string(r.units, ', ');
            
            -- Display students
            RAISE NOTICE 'Students:';
            FOR student IN (
                SELECT *
                FROM jsonb_array_elements(r.students) AS s
            ) LOOP
                RAISE NOTICE '  Admission: %, Name: %',
                    student->>'admission',
                    student->>'name';
            END LOOP;
            
            -- Display content
            RAISE NOTICE 'Content:';
            FOR content IN (
                SELECT *
                FROM jsonb_array_elements(r.content) AS c
            ) LOOP
                RAISE NOTICE '  Title: %, Unit: %',
                    content->>'title',
                    content->>'unit';
            END LOOP;
        END LOOP;
    END IF;
END $$; 