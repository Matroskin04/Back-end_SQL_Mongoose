import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IconOfBlog } from '../../../domain/icon-of-blog.entity';
import { Repository } from 'typeorm';
import { WallpaperOfBlog } from '../../../domain/wallpaper-of-blog.entity';
import { BlogPhotoInfoViewType } from './types/photos-for-blog.types.query.repository';
import { BlogPhotoInfoType } from '../repository/photos-for-blog.types.repository';

@Injectable()
export class PhotosForBlogQueryRepository {
  constructor(
    @InjectRepository(IconOfBlog)
    protected iconOfBlogRepo: Repository<IconOfBlog>,
    @InjectRepository(WallpaperOfBlog)
    protected wallpaperOfBlogRepo: Repository<WallpaperOfBlog>,
  ) {}

  async getWallpaperOfBlog(blogId: string): Promise<BlogPhotoInfoType | null> {
    const query = this.wallpaperOfBlogRepo
      .createQueryBuilder()
      .select(['url', 'width', 'height', '"fileSize"', '"blogId"'])
      .where('blogId = :blogId', { blogId });

    const result = await query.getRawOne();

    return result ?? null;
  }

  async getIconsOfBlog(blogId: string): Promise<BlogPhotoInfoViewType[] | []> {
    const query = this.iconOfBlogRepo
      .createQueryBuilder()
      .select(['url', 'width', 'height', '"fileSize"'])
      .where('"blogId" = :blogId', { blogId });

    const result = await query.getRawMany();

    return result;
  }
}
