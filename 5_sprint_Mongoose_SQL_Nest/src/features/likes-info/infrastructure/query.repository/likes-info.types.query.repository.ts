import {
  CommentsLikesInfoDBTypeMongo,
  PostsLikesInfoDBType,
} from '../../domain/likes-info.db.types';

export type PostsLikesInfoOfUserType = Array<PostsLikesInfoDBType>;

export type CommentsLikesInfoOfUserType = Array<CommentsLikesInfoDBTypeMongo>;
