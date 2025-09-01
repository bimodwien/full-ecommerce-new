import multer, { FileFilterCallback } from 'multer';
import { type Request } from 'express';

const maxSize = 1048576; // 1MB

const multerConfig: multer.Options = {
  fileFilter: (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => {
    if (file.mimetype.split('/')[1] !== 'images') {
      return cb(new Error('Only image files are allowed'));
    }
    const fileSize = parseInt(req.headers['content-length'] || '');
    if (fileSize > maxSize) {
      return cb(new Error('File size exceeds 1MB'));
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
