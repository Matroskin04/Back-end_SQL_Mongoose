import {
  NewestLikesType,
  PostTypeWithId,
} from '../repository/posts.types.repositories';
import { PostDBType } from '../../domain/posts.db.types';
import { ObjectId } from 'mongodb';

export type PostPaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<PostTypeWithId>;
};

export type PostViewType = PostTypeWithId & {
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: 'None' | 'Like' | 'Dislike';
    newestLikes: NewestLikesType;
  };
};

export type PostMainInfoType = {
  _id: ObjectId;
  title: 'string';
  blogId: 'string';
  blogName: 'string';
};

export type PostsDBType = Array<PostDBType>;

export type BlogsIdInputType = Array<{ _id: ObjectId }>;

export type PostsIdOfBloggerType = Array<{
  _id: ObjectId;
}>;
