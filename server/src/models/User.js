const pool = require('../config/database');

class User {
    static async create({ name, email, phone = null, password, avatar = null }) {
        const [result] = await pool.query(
            `INSERT INTO users (name, email, phone, password, avatar, status) 
             VALUES (?, ?, ?, ?, ?, 'offline')`,
            [name, email, phone, password, avatar]
        );
        return this.findById(result.insertId);
    }

    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT id, name, email, phone, avatar, status, last_seen_at, created_at, updated_at 
             FROM users WHERE id = ?`,
            [id]
        );
        return rows[0] || null;
    }

    static async findByEmail(email) {
        const [rows] = await pool.query(
            `SELECT * FROM users WHERE email = ?`,
            [email]
        );
        return rows[0] || null;
    }

    static async updateStatus(id, status) {
        if (status === 'offline') {
            await pool.query(
                `UPDATE users SET status = ?, last_seen_at = NOW() WHERE id = ?`,
                [status, id]
            );
        } else {
            await pool.query(
                `UPDATE users SET status = ? WHERE id = ?`,
                [status, id]
            );
        }
        return this.findById(id);
    }

    static async search(query, currentUserId) {
        const searchTerm = `%${query}%`;
        const [rows] = await pool.query(
            `SELECT id, name, email, phone, avatar, status, last_seen_at 
             FROM users 
             WHERE id != ? AND (name LIKE ? OR email LIKE ?)
             ORDER BY name ASC 
             LIMIT 20`,
            [currentUserId, searchTerm, searchTerm]
        );
        return rows;
    }

    static async getAllContacts(currentUserId) {
        // Retrieve all contacts with their direct conversationId (if any),
        // last message preview, and unread count for current user
        const sql = `
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.phone, 
                u.avatar, 
                u.status, 
                u.last_seen_at,
                convo.conversation_id,
                lm.id AS last_message_id,
                lm.masked_content AS last_message,
                lm.sender_id AS last_message_sender_id,
                lm.created_at AS last_message_time,
                lm.status AS last_message_status,
                COALESCE(unread.unread_count, 0) AS unread_count
            FROM users u
            LEFT JOIN (
                SELECT 
                    cp1.conversation_id, 
                    cp2.user_id AS other_user_id
                FROM conversation_participants cp1
                JOIN conversation_participants cp2 
                    ON cp1.conversation_id = cp2.conversation_id 
                   AND cp2.user_id != cp1.user_id
                JOIN conversations c 
                    ON c.id = cp1.conversation_id 
                   AND c.type = 'private'
                WHERE cp1.user_id = ?
            ) convo ON convo.other_user_id = u.id
            LEFT JOIN messages lm ON lm.id = (
                SELECT m.id 
                FROM messages m 
                WHERE m.conversation_id = convo.conversation_id 
                ORDER BY m.id DESC 
                LIMIT 1
            )
            LEFT JOIN (
                SELECT 
                    m.conversation_id, 
                    m.sender_id, 
                    COUNT(*) AS unread_count
                FROM messages m
                WHERE m.status != 'read'
                GROUP BY m.conversation_id, m.sender_id
            ) unread ON unread.conversation_id = convo.conversation_id AND unread.sender_id = u.id
            WHERE u.id != ?
            ORDER BY COALESCE(lm.created_at, u.created_at) DESC
        `;
        const [rows] = await pool.query(sql, [currentUserId, currentUserId]);
        return rows;
    }
}

module.exports = User;
