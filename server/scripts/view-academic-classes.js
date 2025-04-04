const { Pool } = require('pg');

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/university_learning_hub'
});

async function viewAcademicClasses() {
  const client = await pool.connect();
  
  try {
    console.log('Viewing all academic classes...\n');
    
    // Get all groups (which represent classes)
    const groupsResult = await client.query(`
      SELECT 
        g.id AS group_id,
        g.name AS group_name,
        s.id AS semester_id,
        s.name AS semester_name,
        y.id AS year_id,
        y.name AS year_name,
        c.id AS course_id,
        c.name AS course_name,
        p.id AS program_id,
        p.name AS program_name,
        u.id AS university_id,
        u.name AS university_name,
        co.id AS country_id,
        co.name AS country_name
      FROM academic_hierarchy g
      JOIN academic_hierarchy s ON g.parent_id = s.id
      JOIN academic_hierarchy y ON s.parent_id = y.id
      JOIN academic_hierarchy c ON y.parent_id = c.id
      JOIN academic_hierarchy p ON c.parent_id = p.id
      JOIN academic_hierarchy u ON p.parent_id = u.id
      JOIN academic_hierarchy co ON u.parent_id = co.id
      WHERE g.type = 'group'
      ORDER BY co.name, u.name, p.name, c.name, y.name, s.name, g.name
    `);
    
    if (groupsResult.rows.length === 0) {
      console.log('No academic classes found.');
      return;
    }
    
    // Display each class with its complete hierarchy
    groupsResult.rows.forEach((row, index) => {
      console.log(`Class ${index + 1}:`);
      console.log(`  Country: ${row.country_name} (ID: ${row.country_id})`);
      console.log(`  University: ${row.university_name} (ID: ${row.university_id})`);
      console.log(`  Program: ${row.program_name} (ID: ${row.program_id})`);
      console.log(`  Course: ${row.course_name} (ID: ${row.course_id})`);
      console.log(`  Year: ${row.year_name} (ID: ${row.year_id})`);
      console.log(`  Semester: ${row.semester_name} (ID: ${row.semester_id})`);
      console.log(`  Group: ${row.group_name} (ID: ${row.group_id})`);
      
      // Get units for this group
      client.query(
        'SELECT id, name FROM academic_hierarchy WHERE type = $1 AND parent_id = $2',
        ['unit', row.group_id]
      ).then(unitsResult => {
        if (unitsResult.rows.length > 0) {
          console.log('  Units:');
          unitsResult.rows.forEach(unit => {
            console.log(`    - ${unit.name} (ID: ${unit.id})`);
          });
        }
        
        // Get students in this group
        client.query(
          'SELECT id, admission_number, full_name FROM users WHERE group_id = $1',
          [row.group_id]
        ).then(studentsResult => {
          if (studentsResult.rows.length > 0) {
            console.log('  Students:');
            studentsResult.rows.forEach(student => {
              console.log(`    - ${student.full_name} (Admission: ${student.admission_number})`);
            });
          }
          console.log(''); // Empty line for better readability
        });
      });
    });
    
    console.log(`Total classes: ${groupsResult.rows.length}`);
  } catch (error) {
    console.error('Error viewing academic classes:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the function
viewAcademicClasses(); 