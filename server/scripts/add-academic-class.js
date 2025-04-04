const { Pool } = require('pg');
const readline = require('readline');

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/university_learning_hub'
});

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function addAcademicClass() {
  const client = await pool.connect();
  
  try {
    console.log('Adding a new academic class with all its related entities...');
    
    // Start transaction
    await client.query('BEGIN');
    
    // Get country information
    const countryName = await prompt('Enter country name: ');
    const countryDescription = await prompt('Enter country description: ');
    
    // Insert country
    const countryResult = await client.query(
      'INSERT INTO academic_hierarchy (name, type, description) VALUES ($1, $2, $3) RETURNING id',
      [countryName, 'country', countryDescription]
    );
    const countryId = countryResult.rows[0].id;
    console.log(`Country added with ID: ${countryId}`);
    
    // Get university information
    const universityName = await prompt('Enter university name: ');
    const universityDescription = await prompt('Enter university description: ');
    
    // Insert university
    const universityResult = await client.query(
      'INSERT INTO academic_hierarchy (name, type, parent_id, description) VALUES ($1, $2, $3, $4) RETURNING id',
      [universityName, 'university', countryId, universityDescription]
    );
    const universityId = universityResult.rows[0].id;
    console.log(`University added with ID: ${universityId}`);
    
    // Get program information
    const programName = await prompt('Enter program name: ');
    const programDescription = await prompt('Enter program description: ');
    
    // Insert program
    const programResult = await client.query(
      'INSERT INTO academic_hierarchy (name, type, parent_id, description) VALUES ($1, $2, $3, $4) RETURNING id',
      [programName, 'program', universityId, programDescription]
    );
    const programId = programResult.rows[0].id;
    console.log(`Program added with ID: ${programId}`);
    
    // Get course information
    const courseName = await prompt('Enter course name: ');
    const courseDescription = await prompt('Enter course description: ');
    
    // Insert course
    const courseResult = await client.query(
      'INSERT INTO academic_hierarchy (name, type, parent_id, description) VALUES ($1, $2, $3, $4) RETURNING id',
      [courseName, 'course', programId, courseDescription]
    );
    const courseId = courseResult.rows[0].id;
    console.log(`Course added with ID: ${courseId}`);
    
    // Get year information
    const yearName = await prompt('Enter year name (e.g., Year 1): ');
    const yearDescription = await prompt('Enter year description: ');
    
    // Insert year
    const yearResult = await client.query(
      'INSERT INTO academic_hierarchy (name, type, parent_id, description) VALUES ($1, $2, $3, $4) RETURNING id',
      [yearName, 'year', courseId, yearDescription]
    );
    const yearId = yearResult.rows[0].id;
    console.log(`Year added with ID: ${yearId}`);
    
    // Get semester information
    const semesterName = await prompt('Enter semester name (e.g., Semester 1): ');
    const semesterDescription = await prompt('Enter semester description: ');
    
    // Insert semester
    const semesterResult = await client.query(
      'INSERT INTO academic_hierarchy (name, type, parent_id, description) VALUES ($1, $2, $3, $4) RETURNING id',
      [semesterName, 'semester', yearId, semesterDescription]
    );
    const semesterId = semesterResult.rows[0].id;
    console.log(`Semester added with ID: ${semesterId}`);
    
    // Get group information
    const groupName = await prompt('Enter group name (e.g., Group A): ');
    const groupDescription = await prompt('Enter group description: ');
    
    // Insert group
    const groupResult = await client.query(
      'INSERT INTO academic_hierarchy (name, type, parent_id, description) VALUES ($1, $2, $3, $4) RETURNING id',
      [groupName, 'group', semesterId, groupDescription]
    );
    const groupId = groupResult.rows[0].id;
    console.log(`Group added with ID: ${groupId}`);
    
    // Get unit information
    const unitName = await prompt('Enter unit name: ');
    const unitDescription = await prompt('Enter unit description: ');
    
    // Insert unit
    const unitResult = await client.query(
      'INSERT INTO academic_hierarchy (name, type, parent_id, description) VALUES ($1, $2, $3, $4) RETURNING id',
      [unitName, 'unit', groupId, unitDescription]
    );
    const unitId = unitResult.rows[0].id;
    console.log(`Unit added with ID: ${unitId}`);
    
    // Ask if user wants to add a test student
    const addStudent = await prompt('Do you want to add a test student to this class? (y/n): ');
    
    if (addStudent.toLowerCase() === 'y') {
      // Get student information
      const admissionNumber = await prompt('Enter admission number: ');
      const fullName = await prompt('Enter full name: ');
      const email = await prompt('Enter email: ');
      const phone = await prompt('Enter phone: ');
      const password = await prompt('Enter password: ');
      
      // Hash password (using a simple hash for demonstration)
      const passwordHash = require('crypto').createHash('sha256').update(password).digest('hex');
      
      // Insert student
      await client.query(
        `INSERT INTO users (
          admission_number, password_hash, full_name, email, phone,
          country_id, university_id, program_id, course_id, year_id, semester_id, group_id,
          is_admin, is_using_default_password
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          admissionNumber, passwordHash, fullName, email, phone,
          countryId, universityId, programId, courseId, yearId, semesterId, groupId,
          false, true
        ]
      );
      console.log(`Student added with admission number: ${admissionNumber}`);
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('Academic class added successfully!');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error adding academic class:', error);
  } finally {
    client.release();
    rl.close();
  }
}

// Run the function
addAcademicClass(); 