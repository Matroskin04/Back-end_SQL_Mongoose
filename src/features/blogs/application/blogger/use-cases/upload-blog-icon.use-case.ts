import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../../../../../infrastructure/adapters/s3-storage.adapter';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../../../../configuration/configuration';
import { PhotosForBlogRepository } from '../../../infrastructure/typeORM/repository/photos-for-blog.repository';
import { PhotoInfo } from '../../../../general-entities/photo-info.entity';
import { IconOfBlog } from '../../../domain/icon-of-blog.entity';
import { PhotosOfBlogViewType } from '../../../infrastructure/typeORM/query.repository/types/photos-for-blog.types.query.repository';
import { PhotosForBlogQueryRepository } from '../../../infrastructure/typeORM/query.repository/photos-for-blog.query.repository';
import { modifyBlogPhotoIntoViewModel } from '../../../../../infrastructure/utils/functions/features/photos.functions.helpers';

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
    protected photosForBlogQueryRepository: PhotosForBlogQueryRepository,
    protected configService: ConfigService<ConfigType>,
  ) {}
  //todo transaction
  async execute(command: UploadBlogIconCommand): Promise<PhotosOfBlogViewType> {
    const { photo, blogId } = command;

    const url = await this.s3StorageAdapter.saveIconForBlog(blogId, photo);
    const iconInfo = IconOfBlog.createIconInfo(
      url,
      blogId,
      photo.size,
      this.configService,
    );
    await this.photosForBlogRepository.saveBlogIconInfo(iconInfo);

    const icons = await this.photosForBlogQueryRepository.getIconsOfBlog(
      blogId,
    );
    const wallpaper =
      await this.photosForBlogQueryRepository.getWallpaperOfBlog(blogId);

    return modifyBlogPhotoIntoViewModel(wallpaper, icons);
  }
}
