import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../../../../infrastructure/adapters/s3-storage.adapter';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../../../configuration/configuration';
import { PhotoInfoViewType } from '../../../blogs/infrastructure/typeORM/query.repository/types/photos-for-post.types.query.repository';
import { PhotosForPostQueryRepository } from '../../infrastructure/typeORM/query.repository/photos-for-post.query.repository';
import { PhotosForPostRepository } from '../../infrastructure/typeORM/repository/photos-for-post.repository';
import { IconOfPost } from '../../domain/main-img-of-post.entity';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/SQL/query.repository/blogs.query.repository';
import { NotFoundException } from '@nestjs/common';
import * as Buffer from 'buffer';
import sharp from 'sharp';
import { PostPhotoInfoType } from '../../infrastructure/typeORM/repository/photos-for-post.types.repository';
import { modifyPostMainIntoViewModel } from '../../../../infrastructure/utils/functions/features/photos.functions.helpers';
import { PostsQueryRepository } from '../../infrastructure/SQL/query.repository/posts.query.repository';
import { BlogsOrmQueryRepository } from '../../../blogs/infrastructure/typeORM/query.repository/blogs-orm.query.repository';
import { PostsOrmQueryRepository } from '../../infrastructure/typeORM/query.repository/posts-orm.query.repository';

export class UploadPostMainImgCommand {
  constructor(
    public photo: Express.Multer.File,
    public blogId: string,
    public postId: string,
  ) {}
}

@CommandHandler(UploadPostMainImgCommand)
export class UploadPostMainImgUseCase
  implements ICommandHandler<UploadPostMainImgCommand>
{
  constructor(
    protected s3StorageAdapter: S3StorageAdapter,
    protected photosForPostRepository: PhotosForPostRepository,
    protected photosForPostQueryRepository: PhotosForPostQueryRepository,
    protected postsQueryRepository: PostsOrmQueryRepository,
    protected configService: ConfigService<ConfigType>,
  ) {}
  //todo transaction
  async execute(
    command: UploadPostMainImgCommand,
  ): Promise<PhotoInfoViewType[]> {
    const { photo, blogId, postId } = command;

    await this.checkExistencePostOfBlog(postId, blogId);

    const bufferMiddle = await this.resizePhotoMiddle(photo.buffer);
    const bufferSmall = await this.resizePhotoSmall(photo.buffer);

    const arrBuffers = [photo.buffer, bufferMiddle, bufferSmall];

    const urls = await this.uploadPhotosInS3(postId, arrBuffers);
    const iconsInfo = await this.createPhotosInfo(postId, urls, arrBuffers);

    await this.photosForPostRepository.savePostIconsInfo(iconsInfo);

    const icons = await this.photosForPostQueryRepository.getMainImgOfPost(
      postId,
    );
    console.log('icons of post', icons, postId);
    return modifyPostMainIntoViewModel(icons, this.configService);
  }

  private async checkExistencePostOfBlog(
    postId: string,
    blogId: string,
  ): Promise<void> {
    const doesPostExist = await this.postsQueryRepository.doesPostExistAtBlog(
      postId,
      blogId,
    );
    if (!doesPostExist) {
      throw new NotFoundException('Post is not found');
    }
    return;
  }

  private async resizePhotoMiddle(photo: Buffer): Promise<Buffer> {
    const photoMiddle = await sharp(photo)
      .resize({
        width: this.configService.get('photoInfo', { infer: true })!
          .POST_ICON_MIDDLE_WIDTH,
        height: this.configService.get('photoInfo', { infer: true })!
          .POST_ICON_MIDDLE_HEIGHT,
      })
      .toBuffer();
    return photoMiddle;
  }

  private async resizePhotoSmall(photo: Buffer): Promise<Buffer> {
    const photoSmall = await sharp(photo)
      .resize({
        width: this.configService.get('photoInfo', { infer: true })!
          .POST_ICON_SMALL_WIDTH,
        height: this.configService.get('photoInfo', { infer: true })!
          .POST_ICON_SMALL_HEIGHT,
      })
      .toBuffer();
    return photoSmall;
  }

  private async uploadPhotosInS3(
    postId: string,
    photos: Buffer[],
  ): Promise<string[]> {
    const urls: string[] = [];
    for (const photo of photos) {
      const url = await this.s3StorageAdapter.saveIconForPost(postId, photo);
      urls.push(url);
    }
    return urls;
  }

  private async createPhotosInfo(
    postId: string,
    urls: string[],
    buffers: Buffer[],
  ): Promise<PostPhotoInfoType[]> {
    const photos: PostPhotoInfoType[] = [];
    for (let i = 0; i < urls.length; i++) {
      const { width, height, size } = await sharp(buffers[i]).metadata();
      const photo = IconOfPost.createIconInfo(
        urls[i],
        postId,
        size!,
        width!,
        height!,
      );
      photos.push(photo);
    }
    return photos;
  }
}
