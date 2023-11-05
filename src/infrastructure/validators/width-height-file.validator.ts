import { FileValidator } from '@nestjs/common';
import sharp from 'sharp';

export class WidthHeightFileValidator extends FileValidator<{
  width: number;
  height: number;
}> {
  constructor(options: { width: number; height: number }) {
    super(options);
  }

  async isValid(file: Express.Multer.File): Promise<boolean> {
    const image = await sharp(file.buffer)
      .metadata()
      .then(function (metadata) {
        return { width: metadata.width, height: metadata.height };
      });
    return !(
      image.width !== this.validationOptions.width ||
      image.height !== this.validationOptions.height
    );
  }
  buildErrorMessage(): string {
    return `The width and height of the uploaded photo must be ${this.validationOptions.width} and ${this.validationOptions.height} pixels, respectively`;
  }
}
