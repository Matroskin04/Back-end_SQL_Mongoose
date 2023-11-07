import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { PhotoInfo } from '../../general-entities/photo-info.entity';
import { Blogs } from './blogs.entity';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../../configuration/configuration';
import { BlogPhotoInfoType } from '../infrastructure/typeORM/repository/photos-for-blog.types.repository';

@Entity()
export class IconOfBlog extends PhotoInfo {
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
  @PrimaryColumn('uuid')
  id: string;

  @ManyToOne(() => Blogs, (b) => b.iconOfBlog)
  @JoinColumn()
  blog: Blogs;
  @Index('blogId-index')
  @Column()
  blogId: string;

  static createIconInfo(
    url: string,
    blogId: string,
    fileSize: number,
    configService: ConfigService<ConfigType>,
  ): BlogPhotoInfoType {
    return new IconOfBlog(
      url,
      blogId,
      fileSize,
      configService.get('photoInfo', { infer: true })!.BLOG_ICON_WIDTH,
      configService.get('photoInfo', { infer: true })!.BLOG_ICON_HEIGHT,
    );
  }
}
