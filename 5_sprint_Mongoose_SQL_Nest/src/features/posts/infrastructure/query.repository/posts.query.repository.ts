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
import { modifyPostIntoViewModel } from '../../../../infrastructure/utils/functions/features/posts.functions.helpers';
import { StatusOfLike } from '../../../comments/infrastructure/query.repository/comments.types.query.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../../domain/posts.entity';
import { PostModelType } from '../../domain/posts.db.types';
import { LikesInfoQueryRepository } from '../../../likes-info/infrastructure/query.repository/likes-info.query.repository';
import { reformNewestLikes } from '../../../../infrastructure/utils/functions/features/likes-info.functions.helpers';
import { QueryBlogInputModel } from '../../../blogs/api/blogger/models/input/query-blog.input.model';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/query.repository/blogs.query.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AllLikeStatusEnum } from '../../../../infrastructure/utils/enums/like-status';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    protected likesInfoQueryRepository: LikesInfoQueryRepository,
    protected blogsPublicQueryRepository: BlogsQueryRepository,
  ) {}

  //SQL
  async getAllPostsOfBlog(
    blogId: string,
    query: QueryBlogInputModel,
    userId: string | null,
  ): Promise<null | PostPaginationType> {
    const { pageNumber, pageSize, sortBy, sortDirection } =
      variablesForReturn(query);

    const result = await this.dataSource.query(
      `
    SELECT p."id", p."title", p."shortDescription", p."content", p."blogId", p."createdAt", b."name" as "blogName",
      (SELECT COUNT(*)
        FROM public."posts" as p2
            JOIN public."blogs" as b2 
            ON b2."id" = p2."blogId"
        WHERE b2."isBanned" = false AND b2."id" = $4),
        
      (SELECT COUNT(*) as "likesCount"
        FROM public."posts_likes_info"
            WHERE "likeStatus" = $1 AND "postId" = p."id"),
            
      (SELECT COUNT(*) as "dislikesCount"
        FROM public."posts_likes_info"
            WHERE "likeStatus" = $2 AND "postId" = p."id"),
            
      (SELECT "likeStatus" as "myStatus"
        FROM public."posts_likes_info"
            WHERE "userId" = $3 AND "postId" = p."id"),
            
      (SELECT json_agg(to_jsonb("threeLikes")) as "newestLikes"
        FROM (SELECT li."addedAt",li."userId", u."login" FROM public."posts_likes_info" as li
            JOIN public."users" as u
            ON u."id" = li."userId"
        WHERE li."postId" = p."id" AND li."likeStatus" = $1
        GROUP BY u."login", li."addedAt", li."userId"
             ORDER BY "addedAt" DESC
             LIMIT 3) as "threeLikes" )
            
    FROM public."posts" as p
        JOIN public."blogs" as b
        ON b."id" = p."blogId"
    WHERE b."isBanned" = false AND b."id" = $4
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT $5 OFFSET $6`,
      [
        AllLikeStatusEnum.Like,
        AllLikeStatusEnum.Dislike,
        userId,
        blogId,
        +pageSize,
        (+pageNumber - 1) * +pageSize,
      ],
    );
    //todo get likes in json normal?
    return {
      pagesCount: Math.ceil((+result[0]?.count || 0) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +result[0]?.count || 0,
      items: result.map((post) => modifyPostIntoViewModel(post)),
    };
  }

  async getAllPosts(
    query: QueryPostInputModel,
    userId: string | null,
  ): Promise<PostPaginationType> {
    const { pageNumber, pageSize, sortBy, sortDirection } =
      variablesForReturn(query);
    //todo all in one query - normal?
    const result = await this.dataSource.query(
      `
    SELECT p."id", p."title", p."shortDescription", p."content", p."blogId", p."createdAt", b."name" as "blogName",
      (SELECT COUNT(*)
        FROM public."posts" as p2
            JOIN public."blogs" as b2 
            ON b2."id" = p2."blogId"
        WHERE b2."isBanned" = false),
        
      (SELECT COUNT(*) as "likesCount"
        FROM public."posts_likes_info"
            WHERE "likeStatus" = $1 AND "postId" = p."id"),
            
      (SELECT COUNT(*) as "dislikesCount"
        FROM public."posts_likes_info"
            WHERE "likeStatus" = $2 AND "postId" = p."id"),
            
      (SELECT "likeStatus" as "myStatus"
        FROM public."posts_likes_info"
            WHERE "userId" = $3 AND "postId" = p."id"),
            
      (SELECT json_agg(to_jsonb("threeLikes")) as "newestLikes"
        FROM (SELECT li."addedAt",li."userId", u."login" FROM public."posts_likes_info" as li
            JOIN public."users" as u
            ON u."id" = li."userId"
        WHERE li."postId" = p."id" AND li."likeStatus" = $1
        GROUP BY u."login", li."addedAt", li."userId"
             ORDER BY "addedAt" DESC
             LIMIT 3) as "threeLikes" )
            
    FROM public."posts" as p
        JOIN public."blogs" as b
        ON b."id" = p."blogId"
    WHERE b."isBanned" = false
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT $4 OFFSET $5`,
      [
        AllLikeStatusEnum.Like,
        AllLikeStatusEnum.Dislike,
        userId,
        +pageSize,
        (+pageNumber - 1) * +pageSize,
      ],
    );
    //todo get likes in json normal?
    return {
      pagesCount: Math.ceil((+result[0]?.count || 0) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +result[0]?.count || 0,
      items: result.map((post) => modifyPostIntoViewModel(post)),
    };
  }

  async doesPostExist(postId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    SELECT COUNT(*)
    FROM public."posts" as p
        JOIN public."blogs" as b
        ON b."id" = p."blogId"
    WHERE p."id" = $1 AND b."isBanned" = false`,
      [postId],
    );

    return +result[0].count === 1;
  }

  async getPostByIdView(
    postId: string,
    userId: string | null,
  ): Promise<null | PostViewType> {
    const result = await this.dataSource.query(
      `
     SELECT p."id", p."title", p."shortDescription", p."content", p."blogId", p."createdAt", b."name" as "blogName",
        
      (SELECT COUNT(*) as "likesCount"
        FROM public."posts_likes_info"
            WHERE "likeStatus" = $1 AND "postId" = p."id"),
            
      (SELECT COUNT(*) as "dislikesCount"
        FROM public."posts_likes_info"
            WHERE "likeStatus" = $2 AND "postId" = p."id"),
            
      (SELECT "likeStatus" as "myStatus"
        FROM public."posts_likes_info"
            WHERE "userId" = $3 AND "postId" = p."id"),
            
      (SELECT json_agg(to_jsonb("threeLikes")) as "newestLikes"
        FROM (SELECT li."addedAt",li."userId", u."login" FROM public."posts_likes_info" as li
            JOIN public."users" as u
            ON u."id" = li."userId"
        WHERE li."postId" = p."id" AND li."likeStatus" = $1
        GROUP BY u."login", li."addedAt", li."userId"
             ORDER BY "addedAt" DESC
             LIMIT 3) as "threeLikes" )
            
    FROM public."posts" as p
        JOIN public."blogs" as b
        ON b."id" = p."blogId"
    WHERE b."isBanned" = false AND p."id" = $4`,
      [AllLikeStatusEnum.Like, AllLikeStatusEnum.Dislike, userId, postId],
    );

    if (!result[0]) return null;

    return modifyPostIntoViewModel(result[0]);
  }

  async getPostDBInfoById(postId: string): Promise<any> {
    const result = await this.dataSource.query(
      `
    SELECT "blogId", "userId", "title", "shortDescription", "content", "createdAt"
      FROM public."posts"
        WHERE "id" = $1`,
      [postId],
    );
    if (!result[0]) return null;
    return result[0];
  }
}
