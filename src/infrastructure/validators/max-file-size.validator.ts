import { BadRequestException, FileValidator } from '@nestjs/common';
import { createBodyErrorBadRequest } from '../utils/functions/create-error-bad-request.function';

export class MaxFileSizeValidator extends FileValidator<{ maxSize: number }> {
  constructor(options: { maxSize: number }) {
    super(options);
  }
  isValid(file: Express.Multer.File): boolean {
    return file.size < this.validationOptions.maxSize;
  }
  buildErrorMessage(): string {
    throw new BadRequestException(
      createBodyErrorBadRequest('Max size of file should be 100 KB', 'file'),
    );
  }
}
