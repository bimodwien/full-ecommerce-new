import multer, { FileFilterCallback } from 'multer';
import { type Request } from 'express';

const maxSize = 1048576; // 1MB

const multerConfig: multer.Options = {
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    return cb(null, true);
  },
  limits: { fileSize: maxSize },
};

export const imageUploader = () => {
  return multer({
    ...multerConfig,
  });
};
