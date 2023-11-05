import {
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { PhotoInfo } from '../../general-entities/photo-info.entity';
import { Blogs } from './blogs.entity';

@Entity()
export class IconOfBlog extends PhotoInfo {
  @ManyToOne(() => Blogs, (b) => b.iconOfBlog)
  @JoinColumn()
  blog: Blogs;
  @PrimaryColumn()
  blogId: string;
}
