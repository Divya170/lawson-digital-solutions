import { BadRequestException, Controller, Post, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { StaffAuthGuard } from '../auth/staff-auth.guard';
import { code } from '../common/utils';
import { config } from '../config';

const ALLOWED: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/avif': '.avif',
};

mkdirSync(config.uploadDir, { recursive: true });

/** Staff photo upload. Files are stored on disk and served at /uploads/<file>. */
@UseGuards(StaffAuthGuard)
@Controller('admin/uploads')
export class UploadsController {
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: config.uploadDir,
        filename: (_req, file, cb) => {
          const ext = ALLOWED[file.mimetype] || extname(file.originalname).toLowerCase();
          cb(null, `${Date.now().toString(36)}-${code(6).toLowerCase()}${ext}`);
        },
      }),
      limits: { fileSize: 8 * 1024 * 1024, files: 10 },
      fileFilter: (_req, file, cb) => {
        if (ALLOWED[file.mimetype]) cb(null, true);
        else cb(new BadRequestException(`${file.originalname} isn't a PNG, JPG, WebP or AVIF image.`), false);
      },
    }),
  )
  upload(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || !files.length) throw new BadRequestException('Choose at least one image to upload.');
    return { urls: files.map((f) => `/uploads/${f.filename}`) };
  }
}
