import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PhotoInfo } from '../../general-entities/photo-info.entity';
import { Blogs } from '../../blogs/domain/blogs.entity';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../../configuration/configuration';
import { BlogPhotoInfoType } from '../../blogs/infrastructure/typeORM/repository/photos-for-blog.types.repository';
import { Posts } from './posts.entity';
import { PostPhotoInfoType } from '../infrastructure/typeORM/repository/photos-for-post.types.repository';

@Entity()
export class IconOfPost extends PhotoInfo {
  constructor(
    url: string,
    postId: string,
    fileSize: number,
    width: number,
    height: number,
  ) {
    super();
    this.url = url;
    this.postId = postId;
    this.fileSize = fileSize;
    this.width = width;
    this.height = height;
  }
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Posts, (p) => p.iconOfPost)
  @JoinColumn()
  post: Posts;
  @Index('postId-index')
  @Column()
  postId: string;

  static createIconInfo(
    url: string,
    postId: string,
    fileSize: number,
    configService: ConfigService<ConfigType>,
  ): PostPhotoInfoType {
    return new IconOfPost(
      url,
      postId,
      fileSize,
      configService.get('photoInfo', { infer: true })!.POST_ICON_WIDTH,
      configService.get('photoInfo', { infer: true })!.POST_ICON_HEIGHT,
    );
  }
}
