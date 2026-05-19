const db = require("../config/database");

const UserModel = {
	async findById(id) {
		const [rows] = await db.query(
			"SELECT id, openid, unionid, phone, nickname, avatar, gender, birthday, bio, city, credit_score, status, last_login_at, created_at, updated_at FROM users WHERE id = ?",
			[id],
		);
		return rows[0] || null;
	},

	async findByOpenid(openid) {
		const [rows] = await db.query(
			"SELECT id, openid, unionid, phone, nickname, avatar, gender, birthday, bio, city, credit_score, status, last_login_at, created_at, updated_at FROM users WHERE openid = ?",
			[openid],
		);
		return rows[0] || null;
	},

	async findByPhone(phone) {
		const [rows] = await db.query("SELECT * FROM users WHERE phone = ?", [phone]);
		return rows[0] || null;
	},

	async create(data) {
		const [result] = await db.query(
			`INSERT INTO users (openid, unionid, phone, password, nickname, avatar, gender, city)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				data.openid || null,
				data.unionid || null,
				data.phone || null,
				data.password || null,
				data.nickname || "",
				data.avatar || null,
				data.gender || 0,
				data.city || null,
			],
		);
		return this.findById(result.insertId);
	},

	async update(id, data) {
		const fields = [];
		const values = [];
		const allowedFields = ["nickname", "avatar", "gender", "birthday", "bio", "city", "status", "last_login_at"];
		for (const field of allowedFields) {
			if (data[field] !== undefined) {
				fields.push(`${field} = ?`);
				values.push(data[field]);
			}
		}
		if (fields.length === 0) return this.findById(id);
		values.push(id);
		await db.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
		return this.findById(id);
	},

	async updateCreditScore(id, changeAmount) {
		await db.query("UPDATE users SET credit_score = GREATEST(0, LEAST(100, credit_score + ?)) WHERE id = ?", [changeAmount, id]);
		return this.findById(id);
	},

	async list({ page = 1, pageSize = 20, keyword, status, city, orderBy = "created_at", orderDir = "DESC" }) {
		const conditions = [];
		const values = [];
		if (keyword) {
			conditions.push("(nickname LIKE ? OR phone LIKE ?)");
			values.push(`%${keyword}%`, `%${keyword}%`);
		}
		if (status !== undefined) {
			conditions.push("status = ?");
			values.push(status);
		}
		if (city) {
			conditions.push("city = ?");
			values.push(city);
		}
		const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
		const offset = (page - 1) * pageSize;

		const allowedOrderFields = ["created_at", "credit_score", "id"];
		const safeOrderBy = allowedOrderFields.includes(orderBy) ? orderBy : "created_at";
		const safeOrderDir = orderDir === "ASC" ? "ASC" : "DESC";

		const [countResult] = await db.query(`SELECT COUNT(*) as total FROM users ${where}`, values);
		const [rows] = await db.query(
			`SELECT id, nickname, avatar, gender, city, credit_score, status, created_at FROM users ${where} ORDER BY ${safeOrderBy} ${safeOrderDir} LIMIT ? OFFSET ?`,
			[...values, pageSize, offset],
		);
		return { list: rows, total: countResult[0].total };
	},
};

module.exports = UserModel;
