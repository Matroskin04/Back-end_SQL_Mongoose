export type PostType = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
};

export type PostDBType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  userId: string;
  createdAt: string;
};

export type PostTypeWithId = PostType & { id: string };

export type NewestLikesType = Array<{
  addedAt: string;
  userId: string;
  login: string;
}>;

export type BodyPostByBlogIdType = {
  title: string;
  shortDescription: string;
  content: string;
};
