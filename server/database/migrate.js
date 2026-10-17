const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    console.log('🔄 Running database migrations...');

    // First connect without specifying database to create it if it doesn't exist
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: parseInt(process.env.DB_PORT, 10) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    });

    try {
        const schemaPath = path.join(__dirname, 'migrations/001_initial_schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        await connection.query(sql);
        console.log('✅ Migrations completed successfully! Tables created/verified in db_chatsystem.');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

if (require.main === module) {
    migrate();
}

module.exports = migrate;
