import {
  NewestLikesType,
  PostTypeWithId,
} from '../repository/posts.types.repositories';

export type PostPaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<PostViewType>;
};

export type PostViewType = PostTypeWithId & {
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: 'None' | 'Like' | 'Dislike';
    newestLikes: NewestLikesType;
  };
};

export type PostDBType = {
  id: string;
  blogId: string;
  userId: string;
  title: string;
  shortDescription: string;
  content: string;
  createdAt: string;
};
