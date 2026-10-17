const pool = require('../config/database');

class Conversation {
    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT * FROM conversations WHERE id = ?`,
            [id]
        );
        return rows[0] || null;
    }

    static async findPrivateBetween(user1Id, user2Id) {
        const sql = `
            SELECT c.id, c.type, c.created_at, c.updated_at
            FROM conversations c
            JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = ?
            JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = ?
            WHERE c.type = 'private'
            LIMIT 1
        `;
        const [rows] = await pool.query(sql, [user1Id, user2Id]);
        return rows[0] || null;
    }

    static async findOrCreatePrivate(user1Id, user2Id) {
        const existing = await this.findPrivateBetween(user1Id, user2Id);
        if (existing) {
            return existing;
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            const [result] = await conn.query(
                `INSERT INTO conversations (type, updated_at) VALUES ('private', NOW())`
            );
            const conversationId = result.insertId;

            await conn.query(
                `INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)`,
                [conversationId, user1Id, conversationId, user2Id]
            );

            await conn.commit();
            return { id: conversationId, type: 'private' };
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    }

    static async isParticipant(conversationId, userId) {
        const [rows] = await pool.query(
            `SELECT id FROM conversation_participants WHERE conversation_id = ? AND user_id = ?`,
            [conversationId, userId]
        );
        return rows.length > 0;
    }

    static async getOtherParticipant(conversationId, currentUserId) {
        const [rows] = await pool.query(
            `SELECT u.id, u.name, u.email, u.phone, u.avatar, u.status, u.last_seen_at
             FROM conversation_participants cp
             JOIN users u ON u.id = cp.user_id
             WHERE cp.conversation_id = ? AND cp.user_id != ?
             LIMIT 1`,
            [conversationId, currentUserId]
        );
        return rows[0] || null;
    }

    static async updateLastRead(conversationId, userId, messageId) {
        await pool.query(
            `UPDATE conversation_participants 
             SET last_read_message_id = ? 
             WHERE conversation_id = ? AND user_id = ?`,
            [messageId, conversationId, userId]
        );
    }

    static async touch(conversationId) {
        await pool.query(
            `UPDATE conversations SET updated_at = NOW() WHERE id = ?`,
            [conversationId]
        );
    }
}

module.exports = Conversation;
