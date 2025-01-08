import { ConflictException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = (destination: string) => ({
  // Storage configuration for Multer
  storage: diskStorage({
    destination: destination,
    filename: (req, file, cb) => {
      // Generate a random name for the file
      const randomName = Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
      // Append the original file extension to the random name
      cb(null, `${randomName}${extname(file.originalname)}`);
    },
  }),

  // You can add a file filter to only accept certain types of files (e.g., images)
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new ConflictException('Only image files are allowed!'), false);
    }
    cb(null, true);
  },
});
