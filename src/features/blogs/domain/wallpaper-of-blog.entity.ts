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

@Entity()
export class WallpaperOfBlog extends PhotoInfo {
  constructor() {
    super();
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
  ) {
    return {
      url,
      blogId,
      fileSize,
      width: configService.get('photoInfo', { infer: true })!
        .BLOG_WALLPAPER_WIDTH,
      height: configService.get('photoInfo', { infer: true })!
        .BLOG_WALLPAPER_HEIGHT,
    };
  }
}
