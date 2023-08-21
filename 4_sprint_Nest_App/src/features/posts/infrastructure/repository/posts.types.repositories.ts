import { PostDocument } from '../../domain/posts.db.types';

export type PostType = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
};

export type PostTypeWithId = PostType & { id: string };

export type NewestLikesType = Array<{
  addedAt: string;
  userId: string;
  login: string;
}>;

export type BodyPostType = {
  title: string;
  userId: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type BodyPostByBlogIdType = {
  title: string;
  shortDescription: string;
  content: string;
};

export type PostInstanceType = PostDocument;
