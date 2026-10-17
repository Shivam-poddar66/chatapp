const bcrypt = require('bcryptjs');
const pool = require('../src/config/database');
const MaskingService = require('../src/services/masking.service');

async function seed() {
    console.log('🌱 Starting database seeding...');
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // Clear existing records in reverse dependency order
        await conn.query('DELETE FROM messages');
        await conn.query('DELETE FROM conversation_participants');
        await conn.query('DELETE FROM conversations');
        await conn.query('DELETE FROM users');

        // Create Seed Users
        const passwordHash = await bcrypt.hash('password123', 10);
        const users = [
            {
                name: 'Alice Johnson',
                email: 'alice@example.com',
                phone: '+1 555-019-2834',
                password: passwordHash,
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
                status: 'online'
            },
            {
                name: 'Bob Smith',
                email: 'bob.smith@example.com',
                phone: '+91 98765 43210',
                password: passwordHash,
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                status: 'offline'
            },
            {
                name: 'Charlie Brown',
                email: 'charlie.brown@example.com',
                phone: '(555) 123-4567',
                password: passwordHash,
                avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
                status: 'online'
            },
            {
                name: 'Diana Prince',
                email: 'diana@example.com',
                phone: '9876543210',
                password: passwordHash,
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
                status: 'offline'
            }
        ];

        const insertedUserIds = [];
        for (const u of users) {
            const [res] = await conn.query(
                `INSERT INTO users (name, email, phone, password, avatar, status, last_seen_at) 
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [u.name, u.email, u.phone, u.password, u.avatar, u.status]
            );
            insertedUserIds.push(res.insertId);
        }

        console.log(`👤 Inserted ${insertedUserIds.length} demo users`);

        // Create conversation between Alice (id 0) and Bob (id 1)
        const [convo1] = await conn.query(
            `INSERT INTO conversations (type, updated_at) VALUES ('private', NOW())`
        );
        const convo1Id = convo1.insertId;

        await conn.query(
            `INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)`,
            [convo1Id, insertedUserIds[0], convo1Id, insertedUserIds[1]]
        );

        // Add demo messages between Alice and Bob
        const demoMessages = [
            {
                senderId: insertedUserIds[0],
                content: 'Hi Bob! Welcome to the new secure real-time chat.'
            },
            {
                senderId: insertedUserIds[1],
                content: 'Hey Alice! Glad to be here. Did you get the project docs?'
            },
            {
                senderId: insertedUserIds[0],
                content: 'Not yet. Could you email them to me at alice.work@company.org or text my phone +91 98765 43210?'
            },
            {
                senderId: insertedUserIds[1],
                content: 'Sure! You can also reach me at bob.smith@example.com or call (555) 123-4567.'
            }
        ];

        for (const msg of demoMessages) {
            const masked = MaskingService.maskMessage(msg.content);
            await conn.query(
                `INSERT INTO messages (conversation_id, sender_id, original_content, masked_content, status, created_at)
                 VALUES (?, ?, ?, ?, 'read', NOW())`,
                [convo1Id, msg.senderId, msg.content, masked]
            );
        }

        await conn.commit();
        console.log('✅ Seeding completed successfully!');
        console.log('--------------------------------------------------');
        console.log('Demo Credentials for testing:');
        console.log('Email: alice@example.com     | Password: password123');
        console.log('Email: bob.smith@example.com | Password: password123');
        console.log('Email: charlie.brown@example.com | Password: password123');
        console.log('Email: diana@example.com     | Password: password123');
        console.log('--------------------------------------------------');
    } catch (error) {
        await conn.rollback();
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    } finally {
        conn.release();
    }
}

if (require.main === module) {
    seed().then(() => process.exit(0));
}

module.exports = seed;
