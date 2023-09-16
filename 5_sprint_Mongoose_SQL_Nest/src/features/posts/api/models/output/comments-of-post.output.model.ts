import { CommentViewType } from '../../../../comments/infrastructure/SQL/repository/comments.types.repositories';

export type ViewCommentOfPostModel = CommentViewType;

export type ViewAllCommentsOfPostModel = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<CommentViewType>;
};
