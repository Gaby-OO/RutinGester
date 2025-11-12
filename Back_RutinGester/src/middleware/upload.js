import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.resolve('./uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).substring(2,8)}${ext}`;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  // aceptar sólo imágenes
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Sólo se permiten imágenes'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB max

export default upload;
