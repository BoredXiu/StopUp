const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { success } = require("../utils/response");
const config = require("../config");

const uploadDir = path.join(__dirname, "..", "..", config.upload.dir);
const tmpDir = path.join(__dirname, "..", "..", config.upload.tmpDir);

// 确保目录存在
[uploadDir, tmpDir].forEach((dir) => {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 正式上传存储
const mainStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		const dateDir = new Date().toISOString().slice(0, 10).replace(/-/g, "");
		const dir = path.join(uploadDir, dateDir);
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
		cb(null, dir);
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		cb(null, `${uuidv4()}${ext}`);
	},
});

// 临时上传存储
const tmpStorage = multer.diskStorage({
	destination: (req, file, cb) => {
		if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
		cb(null, tmpDir);
	},
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		cb(null, `${uuidv4()}${ext}`);
	},
});

const fileFilter = (req, file, cb) => {
	const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
	if (allowedTypes.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("仅支持 JPG、PNG、GIF、WebP 格式的图片"), false);
	}
};

const multerOpts = { fileFilter, limits: { fileSize: config.upload.maxFileSize } };

const mainUpload = multer({ ...multerOpts, storage: mainStorage });
const tmpUpload = multer({ ...multerOpts, storage: tmpStorage });

const UploadController = {
	// 原有的单文件上传到正式目录
	uploadSingle: mainUpload.single("file"),

	// 上传到临时目录
	uploadTmp: tmpUpload.single("file"),

	async handleUpload(req, res) {
		if (!req.file) {
			return res.status(400).json({ code: 400, message: "请选择文件", data: null });
		}
		const dateDir = new Date().toISOString().slice(0, 10).replace(/-/g, "");
		const url = `/uploads/${dateDir}/${req.file.filename}`;
		res.json(success({ url, filename: req.file.filename, size: req.file.size }));
	},

	// 临时上传：返回 tmp 目录下的访问路径
	async handleTmpUpload(req, res) {
		if (!req.file) {
			return res.status(400).json({ code: 400, message: "请选择文件", data: null });
		}
		const url = `/uploads/tmp/${req.file.filename}`;
		res.json(success({ url, filename: req.file.filename, size: req.file.size, tmp: true }));
	},

	// 确认上传：将 tmp 中的文件移动到正式目录
	async handleConfirm(req, res) {
		const { filename } = req.body;
		if (!filename) {
			return res.status(400).json({ code: 400, message: "缺少文件名", data: null });
		}

		const srcPath = path.join(tmpDir, filename);
		if (!fs.existsSync(srcPath)) {
			return res.status(404).json({ code: 404, message: "临时文件不存在或已过期", data: null });
		}

		const dateDir = new Date().toISOString().slice(0, 10).replace(/-/g, "");
		const destSubDir = path.join(uploadDir, dateDir);
		if (!fs.existsSync(destSubDir)) fs.mkdirSync(destSubDir, { recursive: true });

		const destPath = path.join(destSubDir, filename);

		try {
			fs.renameSync(srcPath, destPath);
		} catch (err) {
			// 如果跨磁盘 rename 失败，尝试复制再删除
			fs.copyFileSync(srcPath, destPath);
			fs.unlinkSync(srcPath);
		}

		const url = `/uploads/${dateDir}/${filename}`;
		res.json(success({ url, filename, size: fs.statSync(destPath).size }));
	},

	// 清理临时目录中超过 TTL 的文件
	cleanTmp() {
		if (!fs.existsSync(tmpDir)) return;
		const now = Date.now();
		const ttl = config.upload.tmpTtlMs;
		let cleaned = 0;
		try {
			const files = fs.readdirSync(tmpDir);
			files.forEach((file) => {
				const filePath = path.join(tmpDir, file);
				try {
					const stat = fs.statSync(filePath);
					if (now - stat.mtimeMs > ttl) {
						fs.unlinkSync(filePath);
						cleaned++;
					}
				} catch (_) {
					/* 忽略单个文件清理错误 */
				}
			});
			if (cleaned > 0) {
				console.log(`[tmp清理] 已清理 ${cleaned} 个过期临时文件`);
			}
		} catch (_) {
			/* 忽略目录读取错误 */
		}
	},
};

module.exports = UploadController;
