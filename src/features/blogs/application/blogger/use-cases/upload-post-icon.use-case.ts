import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../../../../../infrastructure/adapters/s3-storage.adapter';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../../../../configuration/configuration';
import { PhotosForBlogRepository } from '../../../infrastructure/typeORM/repository/photos-for-blog.repository';
import { PhotoInfo } from '../../../../general-entities/photo-info.entity';
import { IconOfBlog } from '../../../domain/icon-of-blog.entity';
import {
  PhotoInfoViewType,
  PhotosOfBlogViewType,
} from '../../../infrastructure/typeORM/query.repository/types/photos-for-post.types.query.repository';
import { PhotosForBlogQueryRepository } from '../../../infrastructure/typeORM/query.repository/photos-for-blog.query.repository';
import { modifyBlogPhotoIntoViewModel } from '../../../../../infrastructure/utils/functions/features/photos.functions.helpers';
import { PhotosForPostQueryRepository } from '../../../../posts/infrastructure/typeORM/query.repository/photos-for-post.query.repository';
import { PhotosForPostRepository } from '../../../../posts/infrastructure/typeORM/repository/photos-for-post.repository';
import { IconOfPost } from '../../../../posts/domain/icon-of-post.entity';
import { BlogsQueryRepository } from '../../../infrastructure/SQL/query.repository/blogs.query.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { createBodyErrorBadRequest } from '../../../../../infrastructure/utils/functions/create-error-bad-request.function';

export class UploadPostIconCommand {
  constructor(
    public photo: Express.Multer.File,
    public blogId: string,
    public postId: string,
  ) {}
}

@CommandHandler(UploadPostIconCommand)
export class UploadPostIconUseCase
  implements ICommandHandler<UploadPostIconCommand>
{
  constructor(
    protected s3StorageAdapter: S3StorageAdapter,
    protected photosForPostRepository: PhotosForPostRepository,
    protected photosForPostQueryRepository: PhotosForPostQueryRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected configService: ConfigService<ConfigType>,
  ) {}
  //todo transaction
  async execute(command: UploadPostIconCommand): Promise<PhotoInfoViewType[]> {
    const { photo, blogId, postId } = command;

    await this.checkExistingBlog(blogId);

    const url = await this.s3StorageAdapter.saveIconForPost(blogId, photo);
    const iconInfo = IconOfPost.createIconInfo(
      url,
      postId,
      photo.size,
      this.configService,
    );
    await this.photosForPostRepository.savePostIconInfo(iconInfo);

    const icons = await this.photosForPostQueryRepository.getIconsOfPost(
      postId,
    );

    return icons;
  }

  private async checkExistingBlog(blogId: string): Promise<void> {
    const doesBlogExist = await this.blogsQueryRepository.doesBlogExist(blogId);
    if (!doesBlogExist) {
      throw new NotFoundException('Blog is not found');
    }
    return;
  }
}
