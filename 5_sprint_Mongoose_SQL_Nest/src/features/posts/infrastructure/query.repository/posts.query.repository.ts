import {
  PostPaginationType,
  PostViewType,
} from './posts.types.query.repository';
import { QueryPostInputModel } from '../../api/models/input/query-post.input.model';
import { variablesForReturn } from '../../../../infrastructure/utils/functions/variables-for-return.function';
import { modifyPostIntoViewModel } from '../../../../infrastructure/utils/functions/features/posts.functions.helpers';
import { Injectable } from '@nestjs/common';
import { QueryBlogsInputModel } from '../../../blogs/api/models/input/queries-blog.input.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AllLikeStatusEnum } from '../../../../infrastructure/utils/enums/like-status';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/query.repository/blogs.query.repository';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {}

  //SQL
  async getAllPostsOfBlog(
    blogId: string,
    query: QueryBlogsInputModel,
    userId: string | null,
  ): Promise<null | PostPaginationType> {
    const blog = await this.blogsQueryRepository.doesBlogExist(blogId);
    if (!blog) return null;

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
        FROM public."posts_likes_info" as li
            JOIN public."users_ban_info" as bi2
            ON li."userId" = bi2."userId"
        WHERE li."likeStatus" = $1 AND li."postId" = p."id" AND bi2."isBanned" = false),
            
      (SELECT COUNT(*) as "dislikesCount"
        FROM public."posts_likes_info" as li
            JOIN public."users_ban_info" as bi2
            ON li."userId" = bi2."userId"
        WHERE li."likeStatus" = $2 AND li."postId" = p."id" AND bi2."isBanned" = false),
            
      (SELECT "likeStatus" as "myStatus"
        FROM public."posts_likes_info" as li
            JOIN public."users_ban_info" as bi2
            ON li."userId" = bi2."userId"
        WHERE li."userId" = $3 AND li."postId" = p."id" AND bi2."isBanned" = false),
            
      (SELECT json_agg(to_jsonb("threeLikes")) as "newestLikes"
        FROM (SELECT li."addedAt",li."userId", u."login" FROM public."posts_likes_info" as li
            JOIN public."users" as u
                ON u."id" = li."userId"
            JOIN public."users_ban_info" as bi2
                ON u."id" = bi2."userId"
        WHERE li."postId" = p."id" AND li."likeStatus" = $1 AND bi2."isBanned" = false
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

    return {
      pagesCount: Math.ceil((+result[0]?.count || 1) / +pageSize),
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

    const result = await this.dataSource.query(
      `
    SELECT p."id", p."title", p."shortDescription", p."content", p."blogId", p."createdAt", b."name" as "blogName",
      (SELECT COUNT(*)
        FROM public."posts" as p2
            JOIN public."blogs" as b2 
            ON b2."id" = p2."blogId"
        WHERE b2."isBanned" = false),
        
      (SELECT COUNT(*) as "likesCount"
       FROM public."posts_likes_info" as li
            JOIN public."users_ban_info" as bi2
            ON li."userId" = bi2."userId"
        WHERE li."likeStatus" = $1 AND li."postId" = p."id" AND bi2."isBanned" = false),
            
      (SELECT COUNT(*) as "dislikesCount"
        FROM public."posts_likes_info" as li
            JOIN public."users_ban_info" as bi2
            ON li."userId" = bi2."userId"
        WHERE li."likeStatus" = $2 AND li."postId" = p."id" AND bi2."isBanned" = false),
            
      (SELECT "likeStatus" as "myStatus"
        FROM public."posts_likes_info" as li
            JOIN public."users_ban_info" as bi2
            ON li."userId" = bi2."userId"
        WHERE li."userId" = $3 AND li."postId" = p."id" AND bi2."isBanned" = false),
            
      (SELECT json_agg(to_jsonb("threeLikes")) as "newestLikes"
        FROM (SELECT li."addedAt",li."userId", u."login" FROM public."posts_likes_info" as li
            JOIN public."users" as u
                ON u."id" = li."userId"
            JOIN public."users_ban_info" as bi2
                ON u."id" = bi2."userId"
        WHERE li."postId" = p."id" AND li."likeStatus" = $1 AND bi2."isBanned" = false
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

    return {
      pagesCount: Math.ceil((+result[0]?.count || 1) / +pageSize),
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
       FROM public."posts_likes_info" as li
            JOIN public."users_ban_info" as bi2
            ON li."userId" = bi2."userId"
        WHERE li."likeStatus" = $1 AND li."postId" = p."id" AND bi2."isBanned" = false),
            
      (SELECT COUNT(*) as "dislikesCount"
        FROM public."posts_likes_info" as li
            JOIN public."users_ban_info" as bi2
            ON li."userId" = bi2."userId"
        WHERE li."likeStatus" = $2 AND li."postId" = p."id" AND bi2."isBanned" = false),
            
      (SELECT "likeStatus" as "myStatus"
        FROM public."posts_likes_info" as li
            JOIN public."users_ban_info" as bi2
            ON li."userId" = bi2."userId"
        WHERE li."userId" = $3 AND li."postId" = p."id" AND bi2."isBanned" = false),
            
      (SELECT json_agg(to_jsonb("threeLikes")) as "newestLikes"
        FROM (SELECT li."addedAt",li."userId", u."login" FROM public."posts_likes_info" as li
            JOIN public."users" as u
                ON u."id" = li."userId"
            JOIN public."users_ban_info" as bi2
                ON u."id" = bi2."userId"
        WHERE li."postId" = p."id" AND li."likeStatus" = $1 AND bi2."isBanned" = false
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
