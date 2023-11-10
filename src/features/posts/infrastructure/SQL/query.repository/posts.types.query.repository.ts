import {
  NewestLikesType,
  PostTypeWithId,
} from '../repository/posts.types.repositories';
import { PhotoInfoViewType } from '../../../../blogs/infrastructure/typeORM/query.repository/types/photos-for-post.types.query.repository';

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
  images: {
    main: PhotoInfoViewType[];
  };
};
