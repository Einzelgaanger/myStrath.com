-- Comprehensive Schema for University Learning Hub
-- This file creates all tables as distinct entities without relations

-- Drop all existing tables first
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

-- Create the class_instances table that will store everything
CREATE TABLE class_instances (
    id SERIAL PRIMARY KEY,
    -- Class identification
    country VARCHAR(100) NOT NULL,
    university VARCHAR(200) NOT NULL,
    program VARCHAR(200) NOT NULL,
    course VARCHAR(200) NOT NULL,
    year INTEGER NOT NULL,
    semester VARCHAR(50) NOT NULL,
    group_name VARCHAR(50) NOT NULL,
    
    -- Units
    units TEXT[] NOT NULL,
    
    -- Super Admin (same across all classes)
    super_admin_name VARCHAR(200) NOT NULL,
    super_admin_admission VARCHAR(50) NOT NULL DEFAULT '000000',
    super_admin_password VARCHAR(255) NOT NULL DEFAULT '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', -- "stratizens#websuperadmin"
    
    -- Admin (specific to each class)
    admin_name VARCHAR(200) NOT NULL,
    admin_admission VARCHAR(50) NOT NULL DEFAULT '000000',
    admin_password VARCHAR(255) NOT NULL DEFAULT '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', -- "stratizens#webadmin"
    
    -- Students (stored as JSONB array)
    students JSONB NOT NULL,
    
    -- Content (stored as JSONB array)
    content JSONB NOT NULL DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure each class is unique
    UNIQUE(country, university, program, course, year, semester, group_name)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    admission_number VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(200),
    phone VARCHAR(20),
    profile_picture VARCHAR(255) DEFAULT 'default-avatar.png',
    class_instance_id INTEGER NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_using_default_password BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE content (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(255),
    url VARCHAR(255),
    class_instance_id INTEGER NOT NULL,
    unit_name VARCHAR(200) NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_class_instances_country ON class_instances(country);
CREATE INDEX idx_class_instances_university ON class_instances(university);
CREATE INDEX idx_class_instances_program ON class_instances(program);
CREATE INDEX idx_class_instances_course ON class_instances(course);
CREATE INDEX idx_class_instances_year ON class_instances(year);
CREATE INDEX idx_class_instances_semester ON class_instances(semester);
CREATE INDEX idx_class_instances_group_name ON class_instances(group_name);
CREATE INDEX idx_users_admission_number ON users(admission_number);
CREATE INDEX idx_users_class_instance_id ON users(class_instance_id);
CREATE INDEX idx_content_class_instance_id ON content(class_instance_id);
CREATE INDEX idx_content_unit_name ON content(unit_name);

-- Insert initial test data

-- =============================================
-- KENYA - University of Nairobi
-- =============================================
COMMENT ON TABLE class_instances IS 'Class instance for University of Nairobi - Electrical Engineering';
INSERT INTO class_instances (
    -- Class identification
    country, university, program, course, year, semester, group_name,
    
    -- Units
    units,
    
    -- Super Admin
    super_admin_name, super_admin_admission, super_admin_password,
    
    -- Class Admin
    admin_name, admin_admission, admin_password,
    
    -- Students
    students,
    
    -- Content
    content
) VALUES (
    -- Class identification
    'Kenya', 
    'University of Nairobi', 
    'Diploma', 
    'Electrical Engineering', 
    2, 
    'One', 
    'A',
    
    -- Units
    ARRAY[
        'Circuit Theory',
        'Power Systems',
        'Digital Electronics',
        'Control Systems',
        'Renewable Energy',
        'Electrical Machines'
    ],
    
    -- Super Admin
    'Prof. Adebayo Ojo',
    '000000',
    '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', -- "stratizens#websuperadmin"
    
    -- Class Admin
    'Dr. Wanjiku Kariuki',
    '000000',
    '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', -- "stratizens#webadmin"
    
    -- Students
    '[
        {
            "admission": "2023001",
            "name": "Brian Ochieng",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        },
        {
            "admission": "2023002",
            "name": "Grace Wambui",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        },
        {
            "admission": "2023003",
            "name": "Kevin Kamau",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        },
        {
            "admission": "2023004",
            "name": "Esther Auma",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        }
    ]',
    
    -- Content
    '[
        {
            "title": "Circuit Theory Basics",
            "description": "Learn about circuit theory",
            "type": "video",
            "url": "https://example.com/video8",
            "unit": "Circuit Theory"
        },
        {
            "title": "Power Systems Overview",
            "description": "Learn about power systems",
            "type": "pdf",
            "url": "https://example.com/pdf6",
            "unit": "Power Systems"
        },
        {
            "title": "Digital Electronics",
            "description": "Learn about digital electronics",
            "type": "video",
            "url": "https://example.com/video9",
            "unit": "Digital Electronics"
        },
        {
            "title": "Control Systems",
            "description": "Learn about control systems",
            "type": "pdf",
            "url": "https://example.com/pdf7",
            "unit": "Control Systems"
        },
        {
            "title": "Renewable Energy",
            "description": "Learn about renewable energy",
            "type": "video",
            "url": "https://example.com/video10",
            "unit": "Renewable Energy"
        },
        {
            "title": "Electrical Machines",
            "description": "Learn about electrical machines",
            "type": "pdf",
            "url": "https://example.com/pdf8",
            "unit": "Electrical Machines"
        }
    ]'
);

-- =============================================
-- NIGERIA - University of Lagos
-- =============================================
COMMENT ON TABLE class_instances IS 'Class instance for University of Lagos - Computer Science';
INSERT INTO class_instances (
    -- Class identification
    country, university, program, course, year, semester, group_name,
    
    -- Units
    units,
    
    -- Super Admin
    super_admin_name, super_admin_admission, super_admin_password,
    
    -- Class Admin
    admin_name, admin_admission, admin_password,
    
    -- Students
    students,
    
    -- Content
    content
) VALUES (
    -- Class identification
    'Nigeria',
    'University of Lagos (UNILAG)',
    'Bachelor''s Degree',
    'Computer Science',
    3,
    'Two',
    'B',
    
    -- Units
    ARRAY[
        'Data Structures & Algorithms',
        'Operating Systems',
        'Database Management',
        'Artificial Intelligence',
        'Software Engineering',
        'Computer Networks'
    ],
    
    -- Super Admin
    'Prof. Adebayo Ojo',
    '000000',
    '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', -- "stratizens#websuperadmin"
    
    -- Class Admin
    'Dr. Ngozi Eze',
    '000000',
    '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', -- "stratizens#webadmin"
    
    -- Students
    '[
        {
            "admission": "2021001",
            "name": "Chinedu Okeke",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        },
        {
            "admission": "2021002",
            "name": "Amina Mohammed",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        },
        {
            "admission": "2021003",
            "name": "Oluwaseun Adeleke",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        },
        {
            "admission": "2021004",
            "name": "Fatima Bello",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        },
        {
            "admission": "2021005",
            "name": "Ibrahim Yusuf",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        }
    ]',
    
    -- Content
    '[
        {
            "title": "Introduction to Data Structures",
            "description": "Learn about data structures in programming",
            "type": "video",
            "url": "https://example.com/video1",
            "unit": "Data Structures & Algorithms"
        },
        {
            "title": "Operating Systems Overview",
            "description": "Learn about operating systems",
            "type": "video",
            "url": "https://example.com/video2",
            "unit": "Operating Systems"
        },
        {
            "title": "Database Design",
            "description": "Learn about database design",
            "type": "pdf",
            "url": "https://example.com/pdf1",
            "unit": "Database Management"
        },
        {
            "title": "Introduction to AI",
            "description": "Learn about artificial intelligence",
            "type": "video",
            "url": "https://example.com/video3",
            "unit": "Artificial Intelligence"
        },
        {
            "title": "Software Development Lifecycle",
            "description": "Learn about SDLC",
            "type": "pdf",
            "url": "https://example.com/pdf2",
            "unit": "Software Engineering"
        },
        {
            "title": "Network Protocols",
            "description": "Learn about network protocols",
            "type": "video",
            "url": "https://example.com/video4",
            "unit": "Computer Networks"
        }
    ]'
);

-- =============================================
-- SOUTH AFRICA - University of Cape Town
-- =============================================
COMMENT ON TABLE class_instances IS 'Class instance for University of Cape Town - Financial Economics';
INSERT INTO class_instances (
    -- Class identification
    country, university, program, course, year, semester, group_name,
    
    -- Units
    units,
    
    -- Super Admin
    super_admin_name, super_admin_admission, super_admin_password,
    
    -- Class Admin
    admin_name, admin_admission, admin_password,
    
    -- Students
    students,
    
    -- Content
    content
) VALUES (
    -- Class identification
    'South Africa',
    'University of Cape Town (UCT)',
    'Master''s Degree',
    'Financial Economics',
    1,
    'Spring',
    'Alpha',
    
    -- Units
    ARRAY[
        'Microeconomic Theory',
        'Econometrics',
        'Financial Markets',
        'Development Economics',
        'Risk Management',
        'Behavioral Finance'
    ],
    
    -- Super Admin
    'Prof. Adebayo Ojo',
    '000000',
    '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', -- "stratizens#websuperadmin"
    
    -- Class Admin
    'Prof. Jan van der Merwe',
    '000000',
    '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', -- "stratizens#webadmin"
    
    -- Students
    '[
        {
            "admission": "2022001",
            "name": "Lerato Molefe",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        },
        {
            "admission": "2022002",
            "name": "Sipho Dlamini",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        },
        {
            "admission": "2022003",
            "name": "Nomvula Khumalo",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        },
        {
            "admission": "2022004",
            "name": "James Pretorius",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        }
    ]',
    
    -- Content
    '[
        {
            "title": "Microeconomic Theory Overview",
            "description": "Learn about microeconomic theory",
            "type": "video",
            "url": "https://example.com/video5",
            "unit": "Microeconomic Theory"
        },
        {
            "title": "Introduction to Econometrics",
            "description": "Learn about econometrics",
            "type": "pdf",
            "url": "https://example.com/pdf3",
            "unit": "Econometrics"
        },
        {
            "title": "Financial Markets Overview",
            "description": "Learn about financial markets",
            "type": "video",
            "url": "https://example.com/video6",
            "unit": "Financial Markets"
        },
        {
            "title": "Development Economics",
            "description": "Learn about development economics",
            "type": "pdf",
            "url": "https://example.com/pdf4",
            "unit": "Development Economics"
        },
        {
            "title": "Risk Management Strategies",
            "description": "Learn about risk management",
            "type": "video",
            "url": "https://example.com/video7",
            "unit": "Risk Management"
        },
        {
            "title": "Behavioral Finance",
            "description": "Learn about behavioral finance",
            "type": "pdf",
            "url": "https://example.com/pdf5",
            "unit": "Behavioral Finance"
        }
    ]'
);

-- =============================================
-- EGYPT - Cairo University
-- =============================================
COMMENT ON TABLE class_instances IS 'Class instance for Cairo University - Statistics and Data Science';
INSERT INTO class_instances (
    -- Class identification
    country, university, program, course, year, semester, group_name,
    
    -- Units
    units,
    
    -- Super Admin
    super_admin_name, super_admin_admission, super_admin_password,
    
    -- Class Admin
    admin_name, admin_admission, admin_password,
    
    -- Students
    students,
    
    -- Content
    content
) VALUES (
    -- Class identification
    'Egypt',
    'Cairo University',
    'Doctorate (PhD)',
    'Statistics and Data Science',
    4,
    'Fall',
    'Research Group 1',
    
    -- Units
    ARRAY[
        'Advanced Machine Learning',
        'Bayesian Statistics',
        'Big Data Analytics',
        'Deep Learning',
        'Research Methodology',
        'Time Series Analysis'
    ],
    
    -- Super Admin
    'Prof. Adebayo Ojo',
    '000000',
    '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', -- "stratizens#websuperadmin"
    
    -- Class Admin
    'Dr. Mariam Salah',
    '000000',
    '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', -- "stratizens#webadmin"
    
    -- Students
    '[
        {
            "admission": "2024001",
            "name": "Youssef Abdelrahman",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        },
        {
            "admission": "2024002",
            "name": "Nadia Farouk",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        },
        {
            "admission": "2024003",
            "name": "Karim Mansour",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        }
    ]',
    
    -- Content
    '[
        {
            "title": "Advanced Machine Learning",
            "description": "Learn about advanced machine learning",
            "type": "video",
            "url": "https://example.com/video11",
            "unit": "Advanced Machine Learning"
        },
        {
            "title": "Bayesian Statistics",
            "description": "Learn about Bayesian statistics",
            "type": "pdf",
            "url": "https://example.com/pdf9",
            "unit": "Bayesian Statistics"
        },
        {
            "title": "Big Data Analytics",
            "description": "Learn about big data analytics",
            "type": "video",
            "url": "https://example.com/video12",
            "unit": "Big Data Analytics"
        },
        {
            "title": "Deep Learning",
            "description": "Learn about deep learning",
            "type": "pdf",
            "url": "https://example.com/pdf10",
            "unit": "Deep Learning"
        },
        {
            "title": "Research Methodology",
            "description": "Learn about research methodology",
            "type": "video",
            "url": "https://example.com/video13",
            "unit": "Research Methodology"
        },
        {
            "title": "Time Series Analysis",
            "description": "Learn about time series analysis",
            "type": "pdf",
            "url": "https://example.com/pdf11",
            "unit": "Time Series Analysis"
        }
    ]'
);

-- =============================================
-- GHANA - Kwame Nkrumah University
-- =============================================
COMMENT ON TABLE class_instances IS 'Class instance for KNUST - Public Health';
INSERT INTO class_instances (
    -- Class identification
    country, university, program, course, year, semester, group_name,
    
    -- Units
    units,
    
    -- Super Admin
    super_admin_name, super_admin_admission, super_admin_password,
    
    -- Class Admin
    admin_name, admin_admission, admin_password,
    
    -- Students
    students,
    
    -- Content
    content
) VALUES (
    -- Class identification
    'Ghana',
    'Kwame Nkrumah University of Science and Technology (KNUST)',
    'Postgraduate Diploma',
    'Public Health',
    1,
    'Two',
    'C',
    
    -- Units
    ARRAY[
        'Epidemiology',
        'Biostatistics',
        'Health Policy',
        'Global Health',
        'Disease Control',
        'Environmental Health'
    ],
    
    -- Super Admin
    'Prof. Adebayo Ojo',
    '000000',
    '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', -- "stratizens#websuperadmin"
    
    -- Class Admin
    'Prof. Kwame Asare',
    '000000',
    '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', -- "stratizens#webadmin"
    
    -- Students
    '[
        {
            "admission": "2025001",
            "name": "Akosua Mensah",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        },
        {
            "admission": "2025002",
            "name": "Kofi Ansah",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        },
        {
            "admission": "2025003",
            "name": "Esi Nyarko",
            "password": "$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK"
        }
    ]',
    
    -- Content
    '[
        {
            "title": "Epidemiology",
            "description": "Learn about epidemiology",
            "type": "video",
            "url": "https://example.com/video14",
            "unit": "Epidemiology"
        },
        {
            "title": "Biostatistics",
            "description": "Learn about biostatistics",
            "type": "pdf",
            "url": "https://example.com/pdf12",
            "unit": "Biostatistics"
        },
        {
            "title": "Health Policy",
            "description": "Learn about health policy",
            "type": "video",
            "url": "https://example.com/video15",
            "unit": "Health Policy"
        },
        {
            "title": "Global Health",
            "description": "Learn about global health",
            "type": "pdf",
            "url": "https://example.com/pdf13",
            "unit": "Global Health"
        },
        {
            "title": "Disease Control",
            "description": "Learn about disease control",
            "type": "video",
            "url": "https://example.com/video16",
            "unit": "Disease Control"
        },
        {
            "title": "Environmental Health",
            "description": "Learn about environmental health",
            "type": "pdf",
            "url": "https://example.com/pdf14",
            "unit": "Environmental Health"
        }
    ]'
);

-- Insert users for each class instance
-- Nigeria class instance
INSERT INTO users (admission_number, password_hash, full_name, email, phone, class_instance_id, role, is_using_default_password)
VALUES 
('SUPER001', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Prof. Adebayo Ojo', 'superadmin@example.com', '+234700000000', 1, 'super_admin', true),
('ADMIN001', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Dr. Ngozi Eze', 'admin1@example.com', '+234700000001', 1, 'admin', true),
('2021001', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Chinedu Okeke', 'chinedu@example.com', '+234700000001', 1, 'student', true),
('2021002', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Amina Mohammed', 'amina@example.com', '+234700000002', 1, 'student', true),
('2021003', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Oluwaseun Adeleke', 'oluwaseun@example.com', '+234700000003', 1, 'student', true),
('2021004', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Fatima Bello', 'fatima@example.com', '+234700000004', 1, 'student', true),
('2021005', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Ibrahim Yusuf', 'ibrahim@example.com', '+234700000005', 1, 'student', true);

-- South Africa class instance
INSERT INTO users (admission_number, password_hash, full_name, email, phone, class_instance_id, role, is_using_default_password)
VALUES 
('SUPER002', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Dr. Thando Nkosi', 'superadmin@example.com', '+27700000000', 2, 'super_admin', true),
('ADMIN002', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Prof. Jan van der Merwe', 'admin2@example.com', '+27700000002', 2, 'admin', true),
('2022001', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Lerato Molefe', 'lerato@example.com', '+27700000001', 2, 'student', true),
('2022002', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Sipho Dlamini', 'sipho@example.com', '+27700000002', 2, 'student', true),
('2022003', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Nomvula Khumalo', 'nomvula@example.com', '+27700000003', 2, 'student', true),
('2022004', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'James Pretorius', 'james@example.com', '+27700000004', 2, 'student', true);

-- Kenya class instance
INSERT INTO users (admission_number, password_hash, full_name, email, phone, class_instance_id, role, is_using_default_password)
VALUES 
('SUPER003', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Eng. Daniel Mwangi', 'superadmin@example.com', '+254700000000', 3, 'super_admin', true),
('ADMIN003', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Dr. Wanjiku Kariuki', 'admin3@example.com', '+254700000003', 3, 'admin', true),
('2023001', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Brian Ochieng', 'brian@example.com', '+254700000001', 3, 'student', true),
('2023002', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Grace Wambui', 'grace@example.com', '+254700000002', 3, 'student', true),
('2023003', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Kevin Kamau', 'kevin@example.com', '+254700000003', 3, 'student', true),
('2023004', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Esther Auma', 'esther@example.com', '+254700000004', 3, 'student', true);

-- Egypt class instance
INSERT INTO users (admission_number, password_hash, full_name, email, phone, class_instance_id, role, is_using_default_password)
VALUES 
('SUPER004', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Prof. Ahmed Hassan', 'superadmin@example.com', '+20700000000', 4, 'super_admin', true),
('ADMIN004', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Dr. Mariam Salah', 'admin4@example.com', '+20700000004', 4, 'admin', true),
('2024001', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Youssef Abdelrahman', 'youssef@example.com', '+20700000001', 4, 'student', true),
('2024002', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Nadia Farouk', 'nadia@example.com', '+20700000002', 4, 'student', true),
('2024003', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Karim Mansour', 'karim@example.com', '+20700000003', 4, 'student', true);

-- Ghana class instance
INSERT INTO users (admission_number, password_hash, full_name, email, phone, class_instance_id, role, is_using_default_password)
VALUES 
('SUPER005', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Dr. Abena Boateng', 'superadmin@example.com', '+233700000000', 5, 'super_admin', true),
('ADMIN005', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Prof. Kwame Asare', 'admin5@example.com', '+233700000005', 5, 'admin', true),
('2025001', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Akosua Mensah', 'akosua@example.com', '+233700000001', 5, 'student', true),
('2025002', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Kofi Ansah', 'kofi@example.com', '+233700000002', 5, 'student', true),
('2025003', '$2b$10$XelREJVN1b/C8jZ8P2yZ6ODXZGEzyA9lX1xOlZGI.7JsUHLGOZ9sK', 'Esi Nyarko', 'esi@example.com', '+233700000003', 5, 'student', true);

-- Insert test content for each class instance
-- Nigeria class instance content
INSERT INTO content (title, description, content_type, url, class_instance_id, unit_name, created_by)
VALUES 
('Introduction to Data Structures', 'Learn about data structures in programming', 'video', 'https://example.com/video1', 1, 'Data Structures & Algorithms', 1),
('Linked List Implementation', 'Learn how to implement linked lists', 'pdf', 'https://example.com/pdf1', 1, 'Data Structures & Algorithms', 1),
('Operating Systems Overview', 'Learn about operating systems', 'video', 'https://example.com/video2', 1, 'Operating Systems', 1),
('Process Management', 'Learn about process management in operating systems', 'pdf', 'https://example.com/pdf2', 1, 'Operating Systems', 1),
('Database Design', 'Learn about database design', 'video', 'https://example.com/video3', 1, 'Database Management', 1),
('SQL Basics', 'Learn the basics of SQL', 'pdf', 'https://example.com/pdf3', 1, 'Database Management', 1),
('Introduction to AI', 'Learn about artificial intelligence', 'video', 'https://example.com/video4', 1, 'Artificial Intelligence', 1),
('Machine Learning Basics', 'Learn the basics of machine learning', 'pdf', 'https://example.com/pdf4', 1, 'Artificial Intelligence', 1),
('Software Development Lifecycle', 'Learn about the software development lifecycle', 'video', 'https://example.com/video5', 1, 'Software Engineering', 1),
('Agile Methodology', 'Learn about agile methodology', 'pdf', 'https://example.com/pdf5', 1, 'Software Engineering', 1),
('Network Protocols', 'Learn about network protocols', 'video', 'https://example.com/video6', 1, 'Computer Networks', 1),
('TCP/IP Model', 'Learn about the TCP/IP model', 'pdf', 'https://example.com/pdf6', 1, 'Computer Networks', 1);

-- South Africa class instance content
INSERT INTO content (title, description, content_type, url, class_instance_id, unit_name, created_by)
VALUES 
('Microeconomic Theory Overview', 'Learn about microeconomic theory', 'video', 'https://example.com/video7', 2, 'Microeconomic Theory', 1),
('Supply and Demand', 'Learn about supply and demand', 'pdf', 'https://example.com/pdf7', 2, 'Microeconomic Theory', 1),
('Introduction to Econometrics', 'Learn about econometrics', 'video', 'https://example.com/video8', 2, 'Econometrics', 1),
('Regression Analysis', 'Learn about regression analysis', 'pdf', 'https://example.com/pdf8', 2, 'Econometrics', 1),
('Financial Markets Overview', 'Learn about financial markets', 'video', 'https://example.com/video9', 2, 'Financial Markets', 1),
('Stock Market Analysis', 'Learn about stock market analysis', 'pdf', 'https://example.com/pdf9', 2, 'Financial Markets', 1),
('Development Economics', 'Learn about development economics', 'video', 'https://example.com/video10', 2, 'Development Economics', 1),
('Economic Growth', 'Learn about economic growth', 'pdf', 'https://example.com/pdf10', 2, 'Development Economics', 1),
('Risk Management Strategies', 'Learn about risk management strategies', 'video', 'https://example.com/video11', 2, 'Risk Management', 1),
('Portfolio Management', 'Learn about portfolio management', 'pdf', 'https://example.com/pdf11', 2, 'Risk Management', 1),
('Behavioral Finance', 'Learn about behavioral finance', 'video', 'https://example.com/video12', 2, 'Behavioral Finance', 1),
('Investor Psychology', 'Learn about investor psychology', 'pdf', 'https://example.com/pdf12', 2, 'Behavioral Finance', 1);

-- Kenya class instance content
INSERT INTO content (title, description, content_type, url, class_instance_id, unit_name, created_by)
VALUES 
('Circuit Theory Basics', 'Learn about circuit theory', 'video', 'https://example.com/video13', 3, 'Circuit Theory', 1),
('Ohm''s Law', 'Learn about Ohm''s law', 'pdf', 'https://example.com/pdf13', 3, 'Circuit Theory', 1),
('Power Systems Overview', 'Learn about power systems', 'video', 'https://example.com/video14', 3, 'Power Systems', 1),
('Transmission Lines', 'Learn about transmission lines', 'pdf', 'https://example.com/pdf14', 3, 'Power Systems', 1),
('Digital Electronics', 'Learn about digital electronics', 'video', 'https://example.com/video15', 3, 'Digital Electronics', 1),
('Logic Gates', 'Learn about logic gates', 'pdf', 'https://example.com/pdf15', 3, 'Digital Electronics', 1),
('Control Systems', 'Learn about control systems', 'video', 'https://example.com/video16', 3, 'Control Systems', 1),
('PID Controllers', 'Learn about PID controllers', 'pdf', 'https://example.com/pdf16', 3, 'Control Systems', 1),
('Renewable Energy', 'Learn about renewable energy', 'video', 'https://example.com/video17', 3, 'Renewable Energy', 1),
('Solar Power', 'Learn about solar power', 'pdf', 'https://example.com/pdf17', 3, 'Renewable Energy', 1),
('Electrical Machines', 'Learn about electrical machines', 'video', 'https://example.com/video18', 3, 'Electrical Machines', 1),
('Transformers', 'Learn about transformers', 'pdf', 'https://example.com/pdf18', 3, 'Electrical Machines', 1);

-- Egypt class instance content
INSERT INTO content (title, description, content_type, url, class_instance_id, unit_name, created_by)
VALUES 
('Advanced Machine Learning', 'Learn about advanced machine learning', 'video', 'https://example.com/video19', 4, 'Advanced Machine Learning', 1),
('Neural Networks', 'Learn about neural networks', 'pdf', 'https://example.com/pdf19', 4, 'Advanced Machine Learning', 1),
('Bayesian Statistics', 'Learn about Bayesian statistics', 'video', 'https://example.com/video20', 4, 'Bayesian Statistics', 1),
('Bayesian Inference', 'Learn about Bayesian inference', 'pdf', 'https://example.com/pdf20', 4, 'Bayesian Statistics', 1),
('Big Data Analytics', 'Learn about big data analytics', 'video', 'https://example.com/video21', 4, 'Big Data Analytics', 1),
('Hadoop', 'Learn about Hadoop', 'pdf', 'https://example.com/pdf21', 4, 'Big Data Analytics', 1),
('Deep Learning', 'Learn about deep learning', 'video', 'https://example.com/video22', 4, 'Deep Learning', 1),
('Convolutional Neural Networks', 'Learn about convolutional neural networks', 'pdf', 'https://example.com/pdf22', 4, 'Deep Learning', 1),
('Research Methodology', 'Learn about research methodology', 'video', 'https://example.com/video23', 4, 'Research Methodology', 1),
('Research Design', 'Learn about research design', 'pdf', 'https://example.com/pdf23', 4, 'Research Methodology', 1),
('Time Series Analysis', 'Learn about time series analysis', 'video', 'https://example.com/video24', 4, 'Time Series Analysis', 1),
('ARIMA Models', 'Learn about ARIMA models', 'pdf', 'https://example.com/pdf24', 4, 'Time Series Analysis', 1);

-- Ghana class instance content
INSERT INTO content (title, description, content_type, url, class_instance_id, unit_name, created_by)
VALUES 
('Epidemiology', 'Learn about epidemiology', 'video', 'https://example.com/video25', 5, 'Epidemiology', 1),
('Disease Outbreaks', 'Learn about disease outbreaks', 'pdf', 'https://example.com/pdf25', 5, 'Epidemiology', 1),
('Biostatistics', 'Learn about biostatistics', 'video', 'https://example.com/video26', 5, 'Biostatistics', 1),
('Statistical Methods', 'Learn about statistical methods', 'pdf', 'https://example.com/pdf26', 5, 'Biostatistics', 1),
('Health Policy', 'Learn about health policy', 'video', 'https://example.com/video27', 5, 'Health Policy', 1),
('Policy Analysis', 'Learn about policy analysis', 'pdf', 'https://example.com/pdf27', 5, 'Health Policy', 1),
('Global Health', 'Learn about global health', 'video', 'https://example.com/video28', 5, 'Global Health', 1),
('Health Systems', 'Learn about health systems', 'pdf', 'https://example.com/pdf28', 5, 'Global Health', 1),
('Disease Control', 'Learn about disease control', 'video', 'https://example.com/video29', 5, 'Disease Control', 1),
('Prevention Strategies', 'Learn about prevention strategies', 'pdf', 'https://example.com/pdf29', 5, 'Disease Control', 1),
('Environmental Health', 'Learn about environmental health', 'video', 'https://example.com/video30', 5, 'Environmental Health', 1),
('Environmental Hazards', 'Learn about environmental hazards', 'pdf', 'https://example.com/pdf30', 5, 'Environmental Health', 1); 