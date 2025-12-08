const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

// Auto-detect XAMPP socket on macOS (fixes EPERM permission errors)
const xamppSocket = '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock';
const useSocket = !process.env.DB_HOST && fs.existsSync(xamppSocket);

// Create connection pool
const poolConfig = useSocket
    ? {
        socketPath: xamppSocket,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'flowerforge',
    }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'flowerforge',
    };

const pool = mysql.createPool({
    ...poolConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Test connection with retry mechanism
const testConnection = async (retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
        try {
            // Use direct connection for testing instead of pool
            const testConfig = useSocket
                ? {
                    socketPath: xamppSocket,
                    user: process.env.DB_USER || 'root',
                    password: process.env.DB_PASSWORD || '',
                    database: process.env.DB_NAME || 'flowerforge'
                }
                : {
                    host: process.env.DB_HOST || 'localhost',
                    port: process.env.DB_PORT || 3306,
                    user: process.env.DB_USER || 'root',
                    password: process.env.DB_PASSWORD || '',
                    database: process.env.DB_NAME || 'flowerforge'
                };
            const connection = await mysql.createConnection(testConfig);
            await connection.ping();
            await connection.end();
            console.log('✅ Database connected successfully');
            return true;
        } catch (error) {
            if (i === retries - 1) {
                console.error('❌ Database connection failed after retries:', error.message);
                return false;
            }
            console.log(`⏳ Retrying database connection... (${i + 1}/${retries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return false;
};

module.exports = { pool, testConnection };
