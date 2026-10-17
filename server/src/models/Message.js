const pool = require('../config/database');

class Message {
    static async create({ conversationId, senderId, originalContent, maskedContent, status = 'sent' }) {
        const [result] = await pool.query(
            `INSERT INTO messages (conversation_id, sender_id, original_content, masked_content, status, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [conversationId, senderId, originalContent, maskedContent, status]
        );

        // Also touch conversation updated_at
        await pool.query(
            `UPDATE conversations SET updated_at = NOW() WHERE id = ?`,
            [conversationId]
        );

        return this.findById(result.insertId);
    }

    static async findById(id) {
        const [rows] = await pool.query(
            `SELECT m.id, m.conversation_id, m.sender_id, m.masked_content AS content, 
                    m.status, m.created_at, u.name AS sender_name, u.avatar AS sender_avatar
             FROM messages m
             JOIN users u ON u.id = m.sender_id
             WHERE m.id = ?`,
            [id]
        );
        return rows[0] || null;
    }

    static async getHistory(conversationId, { beforeId = null, limit = 30 }) {
        const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 100);
        let sql = `
            SELECT m.id, m.conversation_id, m.sender_id, m.masked_content AS content, 
                   m.status, m.created_at, u.name AS sender_name, u.avatar AS sender_avatar
            FROM messages m
            JOIN users u ON u.id = m.sender_id
            WHERE m.conversation_id = ?
        `;
        const params = [conversationId];

        if (beforeId) {
            sql += ` AND m.id < ?`;
            params.push(parseInt(beforeId, 10));
        }

        sql += ` ORDER BY m.id DESC LIMIT ?`;
        params.push(parsedLimit);

        const [rows] = await pool.query(sql, params);
        // Reverse so that the client receives chronological order
        return rows.reverse();
    }

    static async markAsRead(conversationId, senderId) {
        // Mark all unread messages sent by senderId in this conversation as read
        // First get the IDs of the messages that will be marked
        const [targetRows] = await pool.query(
            `SELECT id FROM messages 
             WHERE conversation_id = ? AND sender_id = ? AND status != 'read'`,
            [conversationId, senderId]
        );

        if (targetRows.length === 0) {
            return [];
        }

        const ids = targetRows.map(r => r.id);

        await pool.query(
            `UPDATE messages 
             SET status = 'read' 
             WHERE id IN (?)`,
            [ids]
        );

        return ids;
    }
}

module.exports = Message;
