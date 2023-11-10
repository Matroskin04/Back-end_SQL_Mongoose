import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { PhotoInfo } from '../../general-entities/photo-info.entity';
import { Blogs } from './blogs.entity';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../../configuration/configuration';
import { BlogPhotoInfoType } from '../infrastructure/typeORM/subrepositories/photos-for-blog.types.repository';

@Entity()
export class WallpaperOfBlog extends PhotoInfo {
  constructor(
    url: string,
    blogId: string,
    fileSize: number,
    width: number,
    height: number,
  ) {
    super();
    this.url = url;
    this.blogId = blogId;
    this.fileSize = fileSize;
    this.width = width;
    this.height = height;
  }
  @OneToOne(() => Blogs, (b) => b.wallpaperOfBlog)
  @JoinColumn()
  blog: Blogs;
  @PrimaryColumn()
  blogId: string;

  static createWallpaperInfo(
    url: string,
    blogId: string,
    fileSize: number,
    configService: ConfigService<ConfigType>,
  ): BlogPhotoInfoType {
    // return {
    //   url,
    //   blogId,
    //   fileSize,
    //   width: configService.get('photoInfo', { infer: true })!
    //     .BLOG_WALLPAPER_WIDTH,
    //   height: configService.get('photoInfo', { infer: true })!
    //     .BLOG_WALLPAPER_HEIGHT,
    // };
    return new WallpaperOfBlog(
      url,
      blogId,
      fileSize,
      configService.get('photoInfo', { infer: true })!.BLOG_WALLPAPER_WIDTH,
      configService.get('photoInfo', { infer: true })!.BLOG_WALLPAPER_HEIGHT,
    );
  }
}
