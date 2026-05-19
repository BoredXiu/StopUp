const db = require("../config/database");
const { generatePaymentNo } = require("../utils/helpers");

const PaymentModel = {
	async findById(id) {
		const [rows] = await db.query("SELECT * FROM payments WHERE id = ?", [id]);
		return rows[0] || null;
	},

	async findByTransactionId(transactionId) {
		const [rows] = await db.query("SELECT * FROM payments WHERE transaction_id = ?", [transactionId]);
		return rows[0] || null;
	},

	async findByOrderId(orderId) {
		const [rows] = await db.query("SELECT * FROM payments WHERE order_id = ?", [orderId]);
		return rows[0] || null;
	},

	async create(data) {
		const paymentNo = generatePaymentNo();
		const [result] = await db.query(
			`INSERT INTO payments (payment_no, order_id, user_id, amount, channel, status)
       VALUES (?, ?, ?, ?, ?, 1)`,
			[paymentNo, data.order_id, data.user_id, data.amount, data.channel || "wechat"],
		);
		return this.findById(result.insertId);
	},

	async updateStatus(id, status, extra = {}) {
		const fields = ["status = ?"];
		const values = [status];

		if (status === 2) {
			fields.push("paid_at = NOW()");
		}
		if (extra.transactionId) {
			fields.push("transaction_id = ?");
			values.push(extra.transactionId);
		}
		if (extra.rawData) {
			fields.push("raw_data = ?");
			values.push(JSON.stringify(extra.rawData));
		}

		values.push(id);
		await db.query(`UPDATE payments SET ${fields.join(", ")} WHERE id = ?`, values);
		return this.findById(id);
	},
};

module.exports = PaymentModel;
