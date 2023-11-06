import { BadRequestException, FileValidator } from '@nestjs/common';
import { createBodyErrorBadRequest } from '../utils/functions/create-error-bad-request.function';
export class ImageFileValidator extends FileValidator {
  isValid(file: Express.Multer.File): boolean {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    return allowedMimeTypes.includes(file.mimetype);
  }
  buildErrorMessage(): string {
    throw new BadRequestException(
      createBodyErrorBadRequest('Invalid file type', 'file'),
    );
  }
}
