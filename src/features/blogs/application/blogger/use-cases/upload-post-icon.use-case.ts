import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../../../../../infrastructure/adapters/s3-storage.adapter';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../../../../configuration/configuration';
import { PhotoInfoViewType } from '../../../infrastructure/typeORM/query.repository/types/photos-for-post.types.query.repository';
import { PhotosForPostQueryRepository } from '../../../../posts/infrastructure/typeORM/query.repository/photos-for-post.query.repository';
import { PhotosForPostRepository } from '../../../../posts/infrastructure/typeORM/repository/photos-for-post.repository';
import { IconOfPost } from '../../../../posts/domain/icon-of-post.entity';
import { BlogsQueryRepository } from '../../../infrastructure/SQL/query.repository/blogs.query.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as Buffer from 'buffer';
import sharp from 'sharp';
import { PostPhotoInfoType } from '../../../../posts/infrastructure/typeORM/repository/photos-for-post.types.repository';

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

    const bufferMiddle = await this.resizePhotoMiddle(photo.buffer);
    const bufferSmall = await this.resizePhotoSmall(photo.buffer);

    const arrBuffers = [photo.buffer, bufferMiddle, bufferSmall];

    const urls = await this.uploadPhotosInS3(postId, arrBuffers);
    const iconsInfo = await this.createPhotosInfo(postId, urls, arrBuffers);

    await this.photosForPostRepository.savePostIconsInfo(iconsInfo);

    const icons = await this.photosForPostQueryRepository.getMainImgOfPost(
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
