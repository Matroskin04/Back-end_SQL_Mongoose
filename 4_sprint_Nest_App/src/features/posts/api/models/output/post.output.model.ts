import { PostTypeWithId } from '../../../infrastructure/repository/posts.types.repositories';
import { PostViewType } from '../../../infrastructure/query.repository/posts.types.query.repository';

export type PostOutputModel = PostViewType;

export type ViewAllPostsModel = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<PostTypeWithId>;
};
