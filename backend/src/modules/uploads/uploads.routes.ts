import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '../../middleware/auth.middleware';
import { AppError } from '../../middleware/error.middleware';

const router = Router();

const UPLOAD_BASE = process.env.UPLOAD_DIR ?? path.join(__dirname, '../../../uploads');

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function createStorage(subdir: string) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = path.join(UPLOAD_BASE, subdir);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuidv4()}${ext}`);
    },
  });
}

function imageFilter(_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(400, 'BAD_REQUEST', 'Only JPEG, PNG, WebP and GIF images are allowed') as unknown as Error);
  }
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const genericUpload = multer({ storage: createStorage('images'), fileFilter: imageFilter, limits: { fileSize: MAX_FILE_SIZE } });
const newsUpload = multer({ storage: createStorage('news'), fileFilter: imageFilter, limits: { fileSize: MAX_FILE_SIZE } });
const slidesUpload = multer({ storage: createStorage('slides'), fileFilter: imageFilter, limits: { fileSize: MAX_FILE_SIZE } });
const eventsUpload = multer({ storage: createStorage('events'), fileFilter: imageFilter, limits: { fileSize: MAX_FILE_SIZE } });

router.use(verifyToken);

function buildResponse(req: Request, res: Response, file: Express.Multer.File, subdir: string) {
  const relativePath = `/uploads/${subdir}/${file.filename}`;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.status(201).json({
    success: true,
    data: {
      url: `${baseUrl}${relativePath}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    },
  });
}

// Generic image upload
router.post('/', genericUpload.single('file'), (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError(400, 'BAD_REQUEST', 'No file uploaded');
    buildResponse(req, res, req.file, 'images');
  } catch (err) {
    next(err);
  }
});

// News cover image upload
router.post('/news', newsUpload.single('file'), (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError(400, 'BAD_REQUEST', 'No file uploaded');
    buildResponse(req, res, req.file, 'news');
  } catch (err) {
    next(err);
  }
});

// Home slider image upload
router.post('/slides', slidesUpload.single('file'), (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError(400, 'BAD_REQUEST', 'No file uploaded');
    buildResponse(req, res, req.file, 'slides');
  } catch (err) {
    next(err);
  }
});

// Event banner image upload
router.post('/events', eventsUpload.single('file'), (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError(400, 'BAD_REQUEST', 'No file uploaded');
    buildResponse(req, res, req.file, 'events');
  } catch (err) {
    next(err);
  }
});

export { router as uploadsRouter };
