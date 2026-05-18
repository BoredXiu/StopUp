const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { success } = require('../utils/response');
const config = require('../config');

const uploadDir = path.join(__dirname, '..', '..', config.upload.dir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dateDir = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const dir = path.join(uploadDir, dateDir);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('仅支持 JPG、PNG、GIF、WebP 格式的图片'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: config.upload.maxFileSize },
});

const UploadController = {
  uploadSingle: upload.single('file'),

  async handleUpload(req, res) {
    if (!req.file) {
      return res.status(400).json({ code: 400, message: '请选择文件', data: null });
    }
    const dateDir = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const url = `/uploads/${dateDir}/${req.file.filename}`;
    res.json(success({ url, filename: req.file.filename, size: req.file.size }));
  },
};

module.exports = UploadController;