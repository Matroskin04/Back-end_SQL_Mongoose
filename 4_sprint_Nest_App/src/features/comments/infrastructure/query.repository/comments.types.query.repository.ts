import { CommentDBType } from '../../domain/comments.db.types';
import { CommentViewType } from '../repository/comments.types.repositories';

export type StatusOfLike = 'Like' | 'Dislike' | 'None';

export type CommentsDBType = Array<CommentDBType>;

export type CommentOfPostPaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<CommentViewType>;
};

export type CommentsOfBloggerPaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<CommentOfBloggerType>;
};

export type CommentOfBloggerType = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: StatusOfLike;
  };
  postInfo: {
    id: string;
    title: string;
    blogId: string;
    blogName: string;
  };
};
