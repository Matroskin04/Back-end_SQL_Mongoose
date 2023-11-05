import { Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { PhotoInfo } from '../../general-entities/photo-info.entity';
import { Blogs } from './blogs.entity';

@Entity()
export class IconOfBlog extends PhotoInfo {
  @OneToOne(() => Blogs, (b) => b.iconOfBlog)
  @JoinColumn()
  blog: Blogs;
  @PrimaryColumn()
  blogId: string;
}
