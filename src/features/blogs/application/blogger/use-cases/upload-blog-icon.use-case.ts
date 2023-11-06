import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../../../../../infrastructure/adapters/s3-storage.adapter';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../../../../configuration/configuration';
import { PhotosForBlogRepository } from '../../../infrastructure/typeORM/repository/photos-for-blog.repository';
import { PhotoInfo } from '../../../../general-entities/photo-info.entity';
import { IconOfBlog } from '../../../domain/icon-of-blog.entity';

export class UploadBlogIconCommand {
  constructor(public photo: Express.Multer.File, public blogId: string) {}
}

@CommandHandler(UploadBlogIconCommand)
export class UploadBlogIconUseCase
  implements ICommandHandler<UploadBlogIconCommand>
{
  constructor(
    protected s3StorageAdapter: S3StorageAdapter,
    protected photosForBlogRepository: PhotosForBlogRepository,
    protected configService: ConfigService<ConfigType>,
  ) {}
  async execute(command: UploadBlogIconCommand): Promise<void> {
    const { photo, blogId } = command;

    const url = await this.s3StorageAdapter.saveIconForBlog(blogId, photo);
    const photoInfo = IconOfBlog.createIconInfo(
      url,
      blogId,
      photo.size,
      this.configService,
    );
    await this.photosForBlogRepository.saveBlogIconInfo(photoInfo);

    return;
  }
}
