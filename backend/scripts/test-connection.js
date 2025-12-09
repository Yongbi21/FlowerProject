const { testConnection } = require('../config/database');
require('dotenv').config();

async function runTest() {
    console.log('Testing database connection...');
    console.log('Host:', process.env.DB_HOST || 'localhost');
    console.log('Port:', process.env.DB_PORT || 3306);
    console.log('User:', process.env.DB_USER || 'root');
    console.log('Database:', process.env.DB_NAME || 'flowerforge');
    console.log('Password:', process.env.DB_PASSWORD ? '***' : '(empty)');
    console.log('');

    const connected = await testConnection();

    if (connected) {
        // Show available databases
        const mysql = require('mysql2/promise');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        const [rows] = await connection.query('SHOW DATABASES');
        console.log('\n📊 Available databases:');
        rows.forEach(row => console.log('  -', row.Database));

        await connection.end();
    } else {
        process.exit(1);
    }
}

runTest();
