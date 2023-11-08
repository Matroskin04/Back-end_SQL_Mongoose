import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../../../../../infrastructure/adapters/s3-storage.adapter';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../../../../configuration/configuration';
import { PhotosForBlogRepository } from '../../../infrastructure/typeORM/repository/photos-for-blog.repository';
import { PhotoInfo } from '../../../../general-entities/photo-info.entity';
import { IconOfBlog } from '../../../domain/icon-of-blog.entity';
import { WallpaperOfBlog } from '../../../domain/wallpaper-of-blog.entity';
import { PhotosForBlogQueryRepository } from '../../../infrastructure/typeORM/query.repository/photos-for-blog.query.repository';
import { PhotosOfBlogViewType } from '../../../infrastructure/typeORM/query.repository/types/photos-for-post.types.query.repository';
import { modifyBlogPhotoIntoViewModel } from '../../../../../infrastructure/utils/functions/features/photos.functions.helpers';

export class UploadBlogWallpaperCommand {
  constructor(public photo: Express.Multer.File, public blogId: string) {}
}

@CommandHandler(UploadBlogWallpaperCommand)
export class UploadBlogWallpaperUseCase
  implements ICommandHandler<UploadBlogWallpaperCommand>
{
  constructor(
    protected s3StorageAdapter: S3StorageAdapter,
    protected photosForBlogRepository: PhotosForBlogRepository,
    protected photosForBlogQueryRepository: PhotosForBlogQueryRepository,
    protected configService: ConfigService<ConfigType>,
  ) {}
  //todo transaction
  async execute(
    command: UploadBlogWallpaperCommand,
  ): Promise<PhotosOfBlogViewType> {
    const { photo, blogId } = command;

    const url = await this.s3StorageAdapter.saveWallpaperForBlog(
      blogId,
      photo.buffer,
    );
    await this.deleteLastWallpaperFromS3(blogId);

    const wallpaperInfo = WallpaperOfBlog.createWallpaperInfo(
      url,
      blogId,
      photo.size,
      this.configService,
    );
    await this.photosForBlogRepository.saveBlogWallpaperInfo(wallpaperInfo);

    const icons = await this.photosForBlogQueryRepository.getIconsOfBlog(
      blogId,
    );

    return modifyBlogPhotoIntoViewModel(wallpaperInfo, icons);
  }

  private async deleteLastWallpaperFromS3(blogId: string): Promise<void> {
    const currentWallpaper =
      await this.photosForBlogQueryRepository.getWallpaperOfBlogView(blogId);
    if (currentWallpaper) {
      await this.s3StorageAdapter.deleteWallpaperForBlog(
        blogId,
        currentWallpaper.url,
      );
    }
    return;
  }
}
