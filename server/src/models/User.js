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
                c.id AS conversation_id,
                lm.id AS last_message_id,
                lm.masked_content AS last_message,
                lm.sender_id AS last_message_sender_id,
                lm.created_at AS last_message_time,
                lm.status AS last_message_status,
                (
                    SELECT COUNT(*) 
                    FROM messages m2
                    WHERE m2.conversation_id = c.id 
                      AND m2.sender_id = u.id 
                      AND m2.status != 'read'
                ) AS unread_count
            FROM users u
            LEFT JOIN conversation_participants cp1 ON cp1.user_id = ?
            LEFT JOIN conversation_participants cp2 ON cp2.user_id = u.id AND cp2.conversation_id = cp1.conversation_id
            LEFT JOIN conversations c ON c.id = cp1.conversation_id AND c.type = 'private'
            LEFT JOIN messages lm ON lm.id = (
                SELECT m.id 
                FROM messages m 
                WHERE m.conversation_id = c.id 
                ORDER BY m.id DESC 
                LIMIT 1
            )
            WHERE u.id != ?
            ORDER BY COALESCE(lm.created_at, u.created_at) DESC
        `;
        const [rows] = await pool.query(sql, [currentUserId, currentUserId]);
        return rows;
    }
}

module.exports = User;
