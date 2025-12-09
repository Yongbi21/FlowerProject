const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDatabase() {
    let connection;

    try {
        console.log('🔄 Connecting to MySQL server...');

        // First, connect without specifying a database
        // Use same configuration as config/database.js
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            multipleStatements: true
        });

        console.log('✅ Connected to MySQL server');

        // Read the schema file
        const schemaPath = path.join(__dirname, '../database/schema_complete.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('🔄 Creating database and tables...');

        // Execute the schema
        await connection.query(schema);

        console.log('✅ Database setup completed successfully!');
        console.log('');
        console.log('📊 Default credentials:');
        console.log('   Email: admin@flower.com');
        console.log('   Password: pa55w0rd');
        console.log('');

    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupDatabase();
