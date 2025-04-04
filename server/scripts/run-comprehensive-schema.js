const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/university_learning_hub'
});

async function runComprehensiveSchema() {
  const client = await pool.connect();
  
  try {
    console.log('Starting comprehensive schema execution...');
    
    // Read the comprehensive schema SQL file
    const schemaFilePath = path.join(__dirname, 'comprehensive_schema.sql');
    const schemaSql = fs.readFileSync(schemaFilePath, 'utf8');
    
    // Execute the schema SQL
    console.log('Executing comprehensive schema...');
    await client.query(schemaSql);
    
    console.log('Comprehensive schema executed successfully!');
  } catch (error) {
    console.error('Error executing comprehensive schema:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the function
runComprehensiveSchema(); 