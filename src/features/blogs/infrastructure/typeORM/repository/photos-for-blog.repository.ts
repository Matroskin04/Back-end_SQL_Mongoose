import { Injectable } from '@nestjs/common';
import { BlogPhotoInfoType } from './photos-for-blog.types.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { IconOfBlog } from '../../../domain/icon-of-blog.entity';
import { Repository } from 'typeorm';
import { WallpaperOfBlog } from '../../../domain/wallpaper-of-blog.entity';

@Injectable()
export class PhotosForBlogRepository {
  constructor(
    @InjectRepository(IconOfBlog)
    protected iconOfBlogRepo: Repository<IconOfBlog>,
    @InjectRepository(WallpaperOfBlog)
    protected wallpaperOfBlogRepo: Repository<WallpaperOfBlog>,
  ) {}

  async saveBlogIconInfo(
    photoInfo: BlogPhotoInfoType,
    iconOfBlogRepo: Repository<IconOfBlog> = this.iconOfBlogRepo,
  ): Promise<void> {
    await iconOfBlogRepo
      .createQueryBuilder()
      .insert()
      .values(photoInfo)
      .execute();
    return;
  }

  async saveBlogWallpaperInfo(
    photoInfo: BlogPhotoInfoType,
    wallpaperOfBlogRepo: Repository<WallpaperOfBlog> = this.wallpaperOfBlogRepo,
  ): Promise<void> {
    await wallpaperOfBlogRepo
      .createQueryBuilder()
      .insert()
      .values(photoInfo)
      .execute();
    return;
  }
}
