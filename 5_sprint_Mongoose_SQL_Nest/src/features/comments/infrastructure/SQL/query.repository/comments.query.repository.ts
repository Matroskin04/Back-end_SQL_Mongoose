import { Injectable, NotFoundException } from '@nestjs/common';
import { PostsQueryRepository } from '../../../../posts/infrastructure/SQL/query.repository/posts.query.repository';
import { CommentViewType } from '../repository/comments.types.repositories';
import { QueryPostInputModel } from '../../../../posts/api/models/input/query-post.input.model';
import { variablesForReturn } from '../../../../../infrastructure/utils/functions/variables-for-return.function';
import {
  modifyCommentIntoViewModel,
  modifyCommentsOfBlogger,
} from '../../../../../infrastructure/utils/functions/features/comments.functions.helpers';
import {
  CommentDBType,
  CommentOfPostPaginationType,
  CommentsOfBloggerPaginationType,
} from './comments.output.types.query.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AllLikeStatusEnum } from '../../../../../infrastructure/utils/enums/like-status';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}

  //view methods
  async getCommentsOfPostView(
    postId: string,
    query: QueryPostInputModel,
    userId: string | null,
  ): Promise<CommentOfPostPaginationType | null> {
    const post = await this.postsQueryRepository.doesPostExist(postId);
    if (!post) throw new NotFoundException('Post is not found');

    const { pageNumber, pageSize, sortBy, sortDirection } =
      variablesForReturn(query);

    const commentInfo = await this.dataSource.query(
      `
    SELECT c."id", c."userId", c."content", c."createdAt", u."login" as "userLogin",
      (SELECT COUNT(*)
        FROM public."comments"
            WHERE "postId" = $1),
        
      (SELECT COUNT(*) as "likesCount"
        FROM public."comments_likes_info" as li
            JOIN public."users_ban_info" as bi2
            ON li."userId" = bi2."userId"
        WHERE li."likeStatus" = $2 AND li."commentId" = c."id" AND bi2."isBanned" = false),
            
      (SELECT COUNT(*) as "dislikesCount"
        FROM public."comments_likes_info" as li
            JOIN public."users_ban_info" as bi2
            ON li."userId" = bi2."userId"
        WHERE li."likeStatus" = $3 AND li."commentId" = c."id" AND bi2."isBanned" = false),
            
      (SELECT "likeStatus" as "myStatus"
        FROM public."comments_likes_info" as li
            JOIN public."users_ban_info" as bi2
            ON li."userId" = bi2."userId"
        WHERE li."userId" = $4 AND li."commentId" = c."id" AND bi2."isBanned" = false)
            
    FROM public."comments" as c
        JOIN public."users" as u
            ON u."id" = c."userId"
        JOIN public."users_ban_info" as bi
            ON u."id" = bi."userId"
    WHERE c."postId" = $1 AND bi."isBanned" = false
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT $5 OFFSET $6`,
      [
        postId,
        AllLikeStatusEnum.Like,
        AllLikeStatusEnum.Dislike,
        userId,
        +pageSize,
        (+pageNumber - 1) * +pageSize,
      ],
    );

    return {
      pagesCount: Math.ceil((+commentInfo[0]?.count || 1) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +commentInfo[0]?.count || 0,
      items: commentInfo.map((comment) => modifyCommentIntoViewModel(comment)),
    };
  }

  async getCommentByIdView(
    commentId: string,
    userId: string | null,
  ): Promise<CommentViewType | null> {
    const commentInfo = await this.dataSource.query(
      `
    SELECT c."id", c."userId", c."content", c."createdAt", u."login" as "userLogin",
        
      (SELECT COUNT(*) as "likesCount"
        FROM public."comments_likes_info" as li
            JOIN public."users_ban_info" as bi2
            ON li."userId" = bi2."userId"
        WHERE li."likeStatus" = $1 AND li."commentId" = c."id" AND bi2."isBanned" = false),
            
      (SELECT COUNT(*) as "dislikesCount"
        FROM public."comments_likes_info" as li
            JOIN public."users_ban_info" as bi2
            ON li."userId" = bi2."userId"
        WHERE li."likeStatus" = $2 AND li."commentId" = c."id" AND bi2."isBanned" = false),
            
      (SELECT "likeStatus" as "myStatus"
        FROM public."comments_likes_info" as li
            JOIN public."users_ban_info" as bi2
            ON li."userId" = bi2."userId"
        WHERE li."userId" = $3 AND li."commentId" = c."id" AND bi2."isBanned" = false)
            
    FROM public."comments" as c
        JOIN public."users" as u
            ON u."id" = c."userId"
        JOIN public."users_ban_info" as bi
            ON u."id" = bi."userId"
    WHERE c."id" = $4 AND bi."isBanned" = false`,
      [AllLikeStatusEnum.Like, AllLikeStatusEnum.Dislike, userId, commentId],
    );

    if (!commentInfo[0]) return null;
    return modifyCommentIntoViewModel(commentInfo[0]);
  }

  async getCommentsOfBlogger(
    query: QueryPostInputModel,
    userId: string,
  ): Promise<CommentsOfBloggerPaginationType | null> {
    const { pageNumber, pageSize, sortBy, sortDirection } =
      variablesForReturn(query);

    const allComments = await this.dataSource.query(
      `
    SELECT "userId" FROM "comments" WHERE "userId" = $1`,
      [userId],
    );

    const commentInfo = await this.dataSource.query(
      `
    SELECT c."id", c."userId", c."content", c."createdAt", u."login" as "userLogin", 
           p."id" as "postId", p."title", p."blogId", b."name" as "blogName",
      (SELECT COUNT(*)
        FROM public."comments"
            JOIN public."posts" as p
                ON p."id" = c."postId"
            JOIN public."blogs" as b
                ON b."id" = p."blogId"
            JOIN public."users_ban_info" as bi
                ON u."id" = bi."userId"
        WHERE b."userId" = $1 AND bi."isBanned" = false),
        
      (SELECT COUNT(*) as "likesCount"
        FROM public."comments_likes_info" as li
            WHERE li."likeStatus" = $2 AND li."commentId" = c."id"),
            
      (SELECT COUNT(*) as "dislikesCount"
        FROM public."comments_likes_info" as li
            WHERE li."likeStatus" = $3 AND li."commentId" = c."id"),
            
      (SELECT "likeStatus" as "myStatus"
        FROM public."comments_likes_info" as li
            WHERE li."userId" = $1 AND li."commentId" = c."id")
            
    FROM public."comments" as c
        JOIN public."users" as u
            ON u."id" = c."userId"
        JOIN public."posts" as p
            ON p."id" = c."postId"
        JOIN public."blogs" as b
            ON b."id" = p."blogId"
        JOIN public."users_ban_info" as bi
                ON u."id" = bi."userId"
    WHERE b."userId" = $1 AND bi."isBanned" = false
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT $4 OFFSET $5`,
      [
        userId,
        AllLikeStatusEnum.Like,
        AllLikeStatusEnum.Dislike,
        +pageSize,
        (+pageNumber - 1) * +pageSize,
      ],
    );

    console.log(commentInfo[0]);

    return {
      pagesCount: Math.ceil((+commentInfo[0]?.count || 1) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +commentInfo[0]?.count || 0,
      items: commentInfo.map((comment) => modifyCommentsOfBlogger(comment)),
    };
  }

  //addition methods
  async getCommentDBInfoById(commentId: string): Promise<CommentDBType | null> {
    const commentInfo = await this.dataSource.query(
      `
    SELECT "id", "userId", "postId", "content", "createdAt"
        FROM public."comments" as c
            WHERE "id" = $1`,
      [commentId],
    );
    if (!commentInfo[0]) return null;
    return commentInfo[0];
  }
}
