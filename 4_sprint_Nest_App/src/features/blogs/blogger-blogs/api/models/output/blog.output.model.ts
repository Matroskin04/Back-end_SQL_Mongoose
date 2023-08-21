import { PostTypeWithId } from '../../../../../posts/infrastructure/repository/posts.types.repositories';
import { ObjectId } from 'mongodb';
import { BlogType } from '../../../../super-admin-blogs/infrastructure/repository/blogs-sa.types.repositories';

export type BlogOutputModel = BlogType & { id: ObjectId };

export type ViewAllBlogsModel = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<BlogOutputModel>;
};

export type ViewPostsOfBlogModel = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<PostTypeWithId>;
};
