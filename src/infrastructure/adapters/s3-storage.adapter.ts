import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { ConfigType } from '../../configuration/configuration';

@Injectable()
export class S3StorageAdapter {
  s3Client: S3Client;
  constructor(protected configService: ConfigService<ConfigType>) {
    this.s3Client = new S3Client({
      region: 'ru-central1',
      endpoint: 'https://storage.yandexcloud.net',
      credentials: {
        accessKeyId: 'YCAJEiqYDt3UgTL21GiDwC9t8',
        secretAccessKey: 'YCMul3imvfJ3ubN9Tt45cZCIpv2Cg-2KhQlubclM',
      },
    });
  }

  async saveIconForBlog(
    blogId: string,
    photo: Express.Multer.File,
  ): Promise<string> {
    try {
      const iconId = uuidv4();
      const fileUrl = `blogs/${blogId}/icons/${iconId}_icon.png`;
      // Put an object into an Amazon S3 bucket.
      const result = await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.configService.get('S3', { infer: true })!.BUCKET_NAME,
          Key: fileUrl,
          Body: photo.buffer,
          ContentType: 'image/png',
        }),
      );
      console.log(result);
      return fileUrl;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async saveWallpaperForBlog(
    blogId: string,
    photo: Express.Multer.File,
  ): Promise<string> {
    try {
      const wallpaperId = uuidv4();
      const fileUrl = `blogs/${blogId}/wallpapers/${wallpaperId}_wallpaper.png`;
      // Put an object into an Amazon S3 bucket.
      const result = await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.configService.get('S3', { infer: true })!.BUCKET_NAME,
          Key: fileUrl,
          Body: photo.buffer,
          ContentType: 'image/png',
        }),
      );
      return fileUrl;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
