const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const path = require('path');

const s3 = new S3Client({
  endpoint: process.env.STORAGE_ENDPOINT,
  region: process.env.STORAGE_REGION,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.STORAGE_SECRET_KEY,
  },
  forcePathStyle: true, // Cần thiết cho Supabase / MinIO
});

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_DOC_TYPES   = ['application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Loại file không được hỗ trợ: ${file.mimetype}`), false);
  }
};

const makeStorage = (folder) => multerS3({
  s3,
  bucket: process.env.STORAGE_BUCKET,
  acl: 'public-read',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${folder}/${unique}${ext}`);
  },
});

// Upload ảnh (thumbnail, avatar)
const uploadImage = multer({
  storage: makeStorage('images'),
  fileFilter: fileFilter(ALLOWED_IMAGE_TYPES),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Upload tài liệu PDF/DOCX
const uploadDocument = multer({
  storage: makeStorage('documents'),
  fileFilter: fileFilter(ALLOWED_DOC_TYPES),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

// Lấy public URL từ key của file
const getPublicUrl = (key) => `${process.env.STORAGE_PUBLIC_URL}/${key}`;

module.exports = { uploadImage, uploadDocument, getPublicUrl, s3 };
