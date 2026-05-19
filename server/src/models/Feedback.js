const db = require("../config/database");

const FeedbackModel = {
	async create(data) {
		const [result] = await db.query(
			`INSERT INTO feedbacks (user_id, type, content, images, contact)
       VALUES (?, ?, ?, ?, ?)`,
			[data.user_id, data.type, data.content, JSON.stringify(data.images || []), data.contact || null],
		);
		return result.insertId;
	},

	async findById(id) {
		const [rows] = await db.query(
			`SELECT f.*, u.nickname, u.avatar
       FROM feedbacks f
       LEFT JOIN users u ON f.user_id = u.id
       WHERE f.id = ?`,
			[id],
		);
		return rows[0] || null;
	},

	async list({ page = 1, pageSize = 20, status, type }) {
		const conditions = [];
		const values = [];

		if (status !== undefined) {
			conditions.push("f.status = ?");
			values.push(status);
		}
		if (type) {
			conditions.push("f.type = ?");
			values.push(type);
		}

		const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
		const offset = (page - 1) * pageSize;

		const [countResult] = await db.query(`SELECT COUNT(*) as total FROM feedbacks f ${where}`, values);
		const [rows] = await db.query(
			`SELECT f.*, u.nickname, u.avatar
       FROM feedbacks f
       LEFT JOIN users u ON f.user_id = u.id
       ${where}
       ORDER BY f.created_at DESC
       LIMIT ? OFFSET ?`,
			[...values, pageSize, offset],
		);
		return { list: rows, total: countResult[0].total };
	},

	async handle(id, handlerId, status, reply) {
		await db.query("UPDATE feedbacks SET status = ?, handler_id = ?, reply = ?, handled_at = NOW() WHERE id = ?", [status, handlerId, reply || null, id]);
		return this.findById(id);
	},
};

module.exports = FeedbackModel;