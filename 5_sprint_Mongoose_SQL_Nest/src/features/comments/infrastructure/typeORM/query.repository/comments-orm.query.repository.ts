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
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { AllLikeStatusEnum } from '../../../../../infrastructure/utils/enums/like-status.enums';
import { Comments } from '../../../domain/comments.entity';
import { CommentsLikesInfo } from '../../../domain/comments-likes-info.entity';
import { UsersBanInfo } from '../../../../users/domain/users-ban-info.entity';

@Injectable()
export class CommentsOrmQueryRepository {
  constructor(
    @InjectRepository(Comments)
    protected commentsRepository: Repository<Comments>,
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

    const result = await this.commentsRepository
      .createQueryBuilder('c')
      .select([
        'c.id AS "id"',
        'c.userId AS "userId"',
        'c.content AS "content"',
        'c.createdAt AS "createdAt"',
        'u.login AS "userLogin"',
      ])
      .addSelect((qb) => this.commentsCountBuilder(qb, postId), 'count')
      .addSelect((qb) => this.likesCountBuilder(qb), 'likesCount')
      .addSelect((qb) => this.dislikesCountBuilder(qb), 'dislikesCount')
      .addSelect((qb) => this.myStatusBuilder(qb, userId), 'myStatus')
      .leftJoin('c.user', 'u')
      .leftJoin('u.userBanInfo', 'bi')
      .where('c.postId = :postId', { postId })
      .andWhere('bi.isBanned = false')
      .orderBy(`c.${sortBy}`, sortDirection)
      .limit(+pageSize)
      .offset((+pageNumber - 1) * +pageSize);

    const commentInfo = await result.getRawMany();

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
    const result = await this.commentsRepository
      .createQueryBuilder('c')
      .select([
        'c.id AS "id"',
        'c.userId AS "userId"',
        'c.content AS "content"',
        'c.createdAt AS "createdAt"',
        'u.login AS "userLogin"',
      ])
      .addSelect((qb) => this.likesCountBuilder(qb), 'likesCount')
      .addSelect((qb) => this.dislikesCountBuilder(qb), 'dislikesCount')
      .addSelect((qb) => this.myStatusBuilder(qb, userId), 'myStatus')
      .leftJoin('c.user', 'u')
      .leftJoin('u.userBanInfo', 'bi')
      .where('c.id = :commentId', { commentId })
      .andWhere('bi.isBanned = false');

    const commentInfo = await result.getRawOne();

    return commentInfo ? modifyCommentIntoViewModel(commentInfo) : null;
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
    const commentInfo = await this.commentsRepository
      .createQueryBuilder('c')
      .select(['c.id', 'c.userId', 'c.postId', 'c.content', 'c.createdAt'])
      .where('id = :commentId', { commentId })
      .getOne();

    return commentInfo
      ? { ...commentInfo, createdAt: commentInfo.createdAt.toISOString() }
      : null;
  }

  private commentsCountBuilder(qb: SelectQueryBuilder<any>, postId) {
    return qb
      .select('COUNT(*)')
      .from(Comments, 'c')
      .where('c.postId = :postId', { postId });
  }

  private likesCountBuilder(qb: SelectQueryBuilder<any>) {
    return qb
      .select('COUNT(*)')
      .from(CommentsLikesInfo, 'li')
      .leftJoin(UsersBanInfo, 'bi', 'li.userId = bi.userId')
      .where('li."likeStatus" = :like', { like: AllLikeStatusEnum.Like })
      .andWhere('li."commentId" = c."id"')
      .andWhere('bi."isBanned" = false');
  }

  private dislikesCountBuilder(qb: SelectQueryBuilder<any>) {
    return qb
      .select('COUNT(*)')
      .from(CommentsLikesInfo, 'li')
      .leftJoin(UsersBanInfo, 'bi', 'li.userId = bi.userId')
      .where('li."likeStatus" = :dislike', {
        dislike: AllLikeStatusEnum.Dislike,
      })
      .andWhere('li."commentId" = c."id"')
      .andWhere('bi."isBanned" = false');
  }

  private myStatusBuilder(qb: SelectQueryBuilder<any>, userId) {
    return qb
      .select('li.likeStatus')
      .from(CommentsLikesInfo, 'li')
      .leftJoin(UsersBanInfo, 'bi', 'li.userId = bi.userId')
      .where('li."userId" = :userId', { userId })
      .andWhere('li."commentId" = c."id"')
      .andWhere('bi."isBanned" = false');
  }
}
