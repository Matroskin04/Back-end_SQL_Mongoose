import { BadRequestException, FileValidator } from '@nestjs/common';
import sharp from 'sharp';
import { createBodyErrorBadRequest } from '../utils/functions/create-error-bad-request.function';

export class WidthHeightFileValidator extends FileValidator<{
  width: number;
  height: number;
}> {
  constructor(options: { width: number; height: number }) {
    super(options);
  }

  async isValid(file: Express.Multer.File): Promise<boolean> {
    const image = await sharp(file.buffer).metadata();

    return !(
      image.width !== this.validationOptions.width ||
      image.height !== this.validationOptions.height
    );
  }
  buildErrorMessage(): string {
    throw new BadRequestException(
      createBodyErrorBadRequest(
        `The width and height of the uploaded photo must be ${this.validationOptions.width} and ${this.validationOptions.height} pixels, respectively`,
        'file',
      ),
    );
  }
}
