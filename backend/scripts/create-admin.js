// Script to create admin account
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
require('dotenv').config();

async function createAdminAccount() {
    try {
        // Generate hash for 'pa55w0rd'
        const password = 'pa55w0rd';
        const hash = await bcrypt.hash(password, 10);

        console.log('✅ Generated hash for password:', password);
        console.log('Hash:', hash);
        console.log('✅ Connected to database');

        // Check if admin exists
        const [existing] = await pool.execute(
            'SELECT * FROM admins WHERE email = ?',
            ['admin@flower.com']
        );

        if (existing.length > 0) {
            console.log('⚠️  Admin already exists, updating password...');
            await pool.execute(
                'UPDATE admins SET password = ? WHERE email = ?',
                [hash, 'admin@flower.com']
            );
            console.log('✅ Password updated');
        } else {
            console.log('Creating new admin account...');
            await pool.execute(
                'INSERT INTO admins (email, password, name, role) VALUES (?, ?, ?, ?)',
                ['admin@flower.com', hash, 'System Administrator', 'admin']
            );
            console.log('✅ Admin account created');
        }

        // Verify
        const [rows] = await pool.execute(
            'SELECT id, email, name, role, created_at FROM admins WHERE email = ?',
            ['admin@flower.com']
        );

        console.log('\n✅ Admin account details:');
        console.log(rows[0]);

        console.log('\n🎉 Success! You can now login with:');
        console.log('Email: admin@flower.com');
        console.log('Password: pa55w0rd');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

createAdminAccount();
