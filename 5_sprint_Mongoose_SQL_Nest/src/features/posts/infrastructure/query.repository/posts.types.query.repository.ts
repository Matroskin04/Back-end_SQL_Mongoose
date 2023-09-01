import {
  NewestLikesType,
  PostTypeWithId,
} from '../repository/posts.types.repositories';
import { PostDBTypeMongo } from '../../domain/posts.db.types';
import { ObjectId } from 'mongodb';

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
