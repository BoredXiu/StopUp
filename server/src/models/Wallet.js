const db = require("../config/database");

let tablesReady = false;

async function ensureTables() {
	if (tablesReady) return;
	await db.query(`
    CREATE TABLE IF NOT EXISTS wallets (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uk_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
	await db.query(`
    CREATE TABLE IF NOT EXISTS wallet_transactions (
      id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      order_no VARCHAR(64) NOT NULL,
      type ENUM('recharge', 'refund', 'withdraw', 'pay') NOT NULL DEFAULT 'recharge',
      amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      balance_before DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      balance_after DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      payment_method VARCHAR(20) DEFAULT 'wechat',
      status TINYINT NOT NULL DEFAULT 1 COMMENT '0-失败 1-成功',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_order_no (order_no),
      KEY idx_user_id (user_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
	tablesReady = true;
}

const WalletModel = {
	/**
	 * 获取或创建用户钱包余额（默认 0.00）
	 */
	async getOrCreate(userId) {
		await ensureTables();
		const [rows] = await db.query("SELECT id, user_id, balance FROM wallets WHERE user_id = ?", [userId]);
		if (rows.length > 0) return rows[0];
		await db.query("INSERT INTO wallets (user_id, balance) VALUES (?, 0.00)", [userId]);
		const [created] = await db.query("SELECT id, user_id, balance FROM wallets WHERE user_id = ?", [userId]);
		return created[0];
	},

	/**
	 * 获取余额
	 */
	async getBalance(userId) {
		const wallet = await this.getOrCreate(userId);
		return wallet.balance;
	},

	/**
	 * 充值 - 增加余额并记录交易
	 */
	async recharge(userId, amount, paymentMethod = "wechat") {
		const wallet = await this.getOrCreate(userId);
		const balanceBefore = parseFloat(wallet.balance);
		const amountNum = parseFloat(amount);

		if (amountNum <= 0 || isNaN(amountNum)) {
			throw new Error("充值金额无效");
		}

		const balanceAfter = +(balanceBefore + amountNum).toFixed(2);
		const orderNo = "RC" + Date.now() + Math.random().toString(36).slice(2, 6).toUpperCase();

		// 更新余额
		await db.query("UPDATE wallets SET balance = ? WHERE user_id = ?", [balanceAfter, userId]);

		// 记录交易
		await db.query(
			`INSERT INTO wallet_transactions
       (user_id, order_no, type, amount, balance_before, balance_after, payment_method, status, created_at)
       VALUES (?, ?, 'recharge', ?, ?, ?, ?, 1, NOW())`,
			[userId, orderNo, amountNum, balanceBefore, balanceAfter, paymentMethod],
		);

		return {
			orderNo,
			amount: amountNum,
			balanceBefore,
			balanceAfter,
			paymentMethod,
		};
	},

	/**
	 * 支付（消费）- 扣除余额并记录交易
	 */
	async pay(userId, amount, orderNo, type = "pay") {
		const wallet = await this.getOrCreate(userId);
		const balanceBefore = parseFloat(wallet.balance);
		const amountNum = parseFloat(amount);

		if (amountNum <= 0 || isNaN(amountNum)) {
			throw new Error("扣款金额无效");
		}

		if (balanceBefore < amountNum) {
			throw new Error("余额不足");
		}

		const balanceAfter = +(balanceBefore - amountNum).toFixed(2);

		await db.query("UPDATE wallets SET balance = ? WHERE user_id = ?", [balanceAfter, userId]);

		await db.query(
			`INSERT INTO wallet_transactions
       (user_id, order_no, type, amount, balance_before, balance_after, payment_method, status, created_at)
       VALUES (?, ?, 'pay', ?, ?, ?, 'balance', 1, NOW())`,
			[userId, orderNo, amountNum, balanceBefore, balanceAfter],
		);

		return {
			orderNo,
			amount: amountNum,
			balanceBefore,
			balanceAfter,
		};
	},

	/**
	 * 获取交易记录
	 */
	async getTransactions(userId, { page = 1, pageSize = 20 }) {
		const offset = (page - 1) * pageSize;
		const [countResult] = await db.query("SELECT COUNT(*) as total FROM wallet_transactions WHERE user_id = ?", [userId]);
		const [rows] = await db.query(
			`SELECT id, order_no, type, amount, balance_before, balance_after, payment_method, status, created_at
       FROM wallet_transactions
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
			[userId, pageSize, offset],
		);
		return { list: rows, total: countResult[0].total };
	},
};

module.exports = WalletModel;
