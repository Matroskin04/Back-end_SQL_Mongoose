import {
  BlogsIdInputType,
  PostMainInfoType,
  PostPaginationType,
  PostsDBType,
  PostsIdOfBloggerType,
  PostViewType,
} from './posts.types.query.repository';
import { ObjectId } from 'mongodb';
import { QueryPostInputModel } from '../../api/models/input/query-post.input.model';
import { variablesForReturn } from '../../../../infrastructure/utils/functions/variables-for-return.function';
import {
  modifyPostForAllDocs,
  modifyPostIntoViewModel,
} from '../../../../infrastructure/utils/functions/features/posts.functions.helpers';
import { StatusOfLike } from '../../../comments/infrastructure/query.repository/comments.types.query.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../../domain/posts.entity';
import { PostModelType } from '../../domain/posts.db.types';
import { LikesInfoQueryRepository } from '../../../likes-info/infrastructure/query.repository/likes-info.query.repository';
import { reformNewestLikes } from '../../../../infrastructure/utils/functions/features/likes-info.functions.helpers';
import { QueryBlogInputModel } from '../../../blogs/blogger-blogs/api/models/input/query-blog.input.model';
import { BlogsIdType } from '../../../blogs/blogger-blogs/infrastructure/query.repository/blogs-blogger.types.query.repository';
import { BlogsPublicQueryRepository } from '../../../blogs/public-blogs/infrastructure/query.repository/blogs-public.query.repository';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    protected likesInfoQueryRepository: LikesInfoQueryRepository,
    protected blogsPublicQueryRepository: BlogsPublicQueryRepository,
  ) {}

  async getAllPosts(
    query: QueryPostInputModel,
    userId: ObjectId | null,
  ): Promise<PostPaginationType> {
    const searchNameTerm: string | null = query?.searchNameTerm ?? null;
    const paramsOfElems = await variablesForReturn(query);
    const allBannedBlogsId =
      await this.blogsPublicQueryRepository.getAllBannedBlogsId();

    const countAllPostsSort = await this.PostModel.countDocuments({
      title: { $regex: searchNameTerm ?? '', $options: 'i' },
    });

    const allPostsOnPages = await this.PostModel.find({
      title: { $regex: searchNameTerm ?? '', $options: 'i' },
      blogId: { $not: { $in: allBannedBlogsId } },
    })
      .skip((+paramsOfElems.pageNumber - 1) * +paramsOfElems.pageSize)
      .limit(+paramsOfElems.pageSize)
      .sort(paramsOfElems.paramSort)
      .lean();

    const allPosts = await Promise.all(
      allPostsOnPages.map(async (p) =>
        modifyPostForAllDocs(p, userId, this.likesInfoQueryRepository),
      ), //todo методы
    );

    return {
      pagesCount: Math.ceil(countAllPostsSort / +paramsOfElems.pageSize),
      page: +paramsOfElems.pageNumber,
      pageSize: +paramsOfElems.pageSize,
      totalCount: countAllPostsSort,
      items: allPosts,
    };
  }

  async getPostsOfBlog(
    blogId: string,
    query: QueryBlogInputModel,
    userId: ObjectId | null,
  ): Promise<null | PostPaginationType> {
    const paramsOfElems = await variablesForReturn(query);
    const countAllPostsSort = await this.PostModel.countDocuments({
      blogId: blogId,
    });

    const allPostsOnPages = await this.PostModel.find({ blogId: blogId })
      .skip((+paramsOfElems.pageNumber - 1) * +paramsOfElems.pageSize)
      .limit(+paramsOfElems.pageSize)
      .sort(paramsOfElems.paramSort)
      .lean();

    if (allPostsOnPages.length === 0) return null;

    const allPostsOfBlog = await Promise.all(
      allPostsOnPages.map(async (p) =>
        modifyPostForAllDocs(p, userId, this.likesInfoQueryRepository),
      ), //2 parameter = userId
    );

    return {
      pagesCount: Math.ceil(countAllPostsSort / +paramsOfElems.pageSize),
      page: +paramsOfElems.pageNumber,
      pageSize: +paramsOfElems.pageSize,
      totalCount: countAllPostsSort,
      items: allPostsOfBlog,
    };
  }

  async getPostById(
    postId: ObjectId,
    userId: ObjectId | null,
  ): Promise<null | PostViewType> {
    const post = await this.PostModel.findOne({ _id: postId });
    if (!post) {
      return null;
    }

    const allBannedBlogsId =
      await this.blogsPublicQueryRepository.getAllBannedBlogsId();
    if (
      //if this post belongs to a blog, return null
      allBannedBlogsId &&
      allBannedBlogsId.findIndex((e) => e._id.toString() === post.blogId) !== -1
    )
      return null;
    //set StatusLike
    let myStatus: StatusOfLike = 'None';

    if (userId) {
      const likeInfo =
        await this.likesInfoQueryRepository.getLikesInfoByPostAndUser(
          postId.toString(),
          userId.toString(),
        );

      if (likeInfo) {
        myStatus = likeInfo.statusLike;
      }
    }

    //find last 3 Likes
    const newestLikes =
      await this.likesInfoQueryRepository.getNewestLikesOfPost(
        postId.toString(),
      );
    const reformedNewestLikes = reformNewestLikes(newestLikes);

    return modifyPostIntoViewModel(post, reformedNewestLikes, myStatus);
  }

  async getPostsByUserId(userId: string): Promise<PostsDBType | null> {
    const posts = await this.PostModel.find({ userId }).lean();
    return posts.length ? posts : null; //if length === 0 -> return null
  }

  async getAllPostsIdOfBlogger(
    arrBlogsId: BlogsIdInputType,
  ): Promise<PostsIdOfBloggerType> {
    let allPostsId: PostsIdOfBloggerType = [];
    for (const blog of arrBlogsId) {
      const postsOfBlog = await this.PostModel.find(
        {
          blogId: blog._id.toString(),
        },
        { _id: 1 },
      ).lean();
      allPostsId = allPostsId.concat(postsOfBlog);
    }
    return allPostsId;
  }

  async getPostMainInfoById(
    postId: ObjectId,
  ): Promise<PostMainInfoType | null> {
    const post = await this.PostModel.findOne(
      { _id: postId },
      { _id: 1, title: 1, blogId: 1, blogName: 1 },
    ).lean();
    console.log('getPostMainInfoById', post);
    return post as PostMainInfoType; //todo type???
  }
}
