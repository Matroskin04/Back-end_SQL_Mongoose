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
  ): Promise<{ url: string }> {
    try {
      const iconId = uuidv4();
      const fileUrl = `blog/${blogId}/icons/${iconId}_icon.png`;
      // Put an object into an Amazon S3 bucket.
      const result = await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.configService.get('S3', { infer: true })!.BUCKET_NAME,
          Key: fileUrl,
          Body: photo.buffer,
        }),
      );
      return {
        url: fileUrl,
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}
