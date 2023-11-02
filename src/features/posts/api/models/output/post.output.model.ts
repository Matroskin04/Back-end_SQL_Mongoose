import { PostTypeWithId } from '../../../infrastructure/SQL/repository/posts.types.repositories';
import { PostViewType } from '../../../infrastructure/SQL/query.repository/posts.types.query.repository';

export type PostOutputModel = PostViewType;

export type ViewAllPostsModel = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<PostTypeWithId>;
};
