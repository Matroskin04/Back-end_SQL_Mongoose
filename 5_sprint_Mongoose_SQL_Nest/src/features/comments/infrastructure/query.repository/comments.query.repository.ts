import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { PostsQueryRepository } from '../../../posts/infrastructure/query.repository/posts.query.repository';
import { CommentViewType } from '../repository/comments.types.repositories';
import { InjectModel } from '@nestjs/mongoose';
import { CommentModelType } from '../../domain/comments.db.types';
import { QueryPostInputModel } from '../../../posts/api/models/input/query-post.input.model';
import {
  variablesForReturn,
  variablesForReturnMongo,
} from '../../../../infrastructure/utils/functions/variables-for-return.function';
import {
  modifyCommentMongo,
  modifyCommentIntoViewModel,
  modifyCommentsOfBlogger,
} from '../../../../infrastructure/utils/functions/features/comments.functions.helpers';
import {
  CommentOfPostPaginationType,
  CommentsDBType,
  CommentsOfBloggerPaginationType,
  StatusOfLike,
} from './comments.types.query.repository';
import { Comment } from '../../domain/comments.entity';
import { LikesInfoQueryRepository } from '../../../likes-info/infrastructure/query.repository/likes-info.query.repository';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/query.repository/blogs.query.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AllLikeStatusEnum } from '../../../../infrastructure/utils/enums/like-status';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    protected postsQueryRepository: PostsQueryRepository,
    protected likesInfoQueryRepository: LikesInfoQueryRepository,
    protected blogsPublicQueryRepository: BlogsQueryRepository,
  ) {}

  //SQL
  async getCommentsOfPost(
    postId: string,
    query: QueryPostInputModel,
    userId: string | null,
  ): Promise<CommentOfPostPaginationType | null> {
    const { pageNumber, pageSize, sortBy, sortDirection } =
      variablesForReturn(query);

    const commentInfo = await this.dataSource.query(
      `
    SELECT c."id", c."userId", c."content", c."createdAt", u."login" as "userLogin",
      (SELECT COUNT(*)
        FROM public."comments"
            WHERE "postId" = $1),
        
      (SELECT COUNT(*) as "likesCount"
        FROM public."comments_likes_info"
            WHERE "likeStatus" = $2 AND "commentId" = c."id"),
            
      (SELECT COUNT(*) as "dislikesCount"
        FROM public."comments_likes_info"
            WHERE "likeStatus" = $3 AND "commentId" = c."id"),
            
      (SELECT "likeStatus" as "myStatus"
        FROM public."comments_likes_info"
            WHERE "userId" = $4 AND "commentId" = c."id")
            
    FROM public."comments" as c
        JOIN public."users" as u
        ON u."id" = c."userId"
    WHERE c."postId" = $1
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
      pagesCount: Math.ceil((+commentInfo[0]?.count || 0) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +commentInfo[0]?.count || 0,
      items: commentInfo.map((comment) => modifyCommentIntoViewModel(comment)),
    };
  }

  async getCommentByIdViewModel(
    commentId: string,
    userId: string | null,
  ): Promise<CommentViewType | null> {
    const commentInfo = await this.dataSource.query(
      `
    SELECT c."id", c."userId", c."content", c."createdAt", u."login" as "userLogin",
        
      (SELECT COUNT(*) as "likesCount"
        FROM public."comments_likes_info"
            WHERE "likeStatus" = $1 AND "commentId" = c."id"),
            
      (SELECT COUNT(*) as "dislikesCount"
        FROM public."comments_likes_info"
            WHERE "likeStatus" = $2 AND "commentId" = c."id"),
            
      (SELECT "likeStatus" as "myStatus"
        FROM public."comments_likes_info"
            WHERE "userId" = $3 AND "commentId" = c."id")
            
    FROM public."comments" as c
        JOIN public."users" as u
        ON u."id" = c."userId"
    WHERE c."id" = $4`,
      [AllLikeStatusEnum.Like, AllLikeStatusEnum.Dislike, userId, commentId],
    );

    if (!commentInfo[0]) return null;
    return modifyCommentIntoViewModel(commentInfo[0]);
  }

  async getCommentDBInfoById(commentId: string): Promise<any | null> {
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

  //MONGO
  async getCommentByIdMongo(
    commentId: string,
    userId: string | null,
  ): Promise<CommentViewType | null> {
    const comment = await this.CommentModel.findOne({
      _id: new ObjectId(commentId),
    });
    if (!comment) {
      return null;
    }

    let myStatus: StatusOfLike = 'None';
    if (userId) {
      const likeInfo =
        await this.likesInfoQueryRepository.getLikesInfoByCommentAndUser(
          commentId,
          userId.toString(),
        );

      if (likeInfo) {
        myStatus = likeInfo.statusLike;
      }
    }

    return modifyCommentMongo(comment, myStatus);
  }

  async getCommentsOfBlogger(
    query: QueryPostInputModel,
    userId: ObjectId,
  ): Promise<CommentsOfBloggerPaginationType | null> {
    const paramsOfElems = await variablesForReturnMongo(query);

    const allBlogsIdOfBlogger = [];
    // await this.blogsPublicQueryRepository.getAllBlogsIdOfBlogger(
    //   userId.toString(),
    // );

    const allPostsIdOfBlogger =
      await this.postsQueryRepository.getAllPostsIdOfBlogger(
        allBlogsIdOfBlogger,
      );

    const countAllCommentsOfBlogger = await this.CommentModel.countDocuments({
      postId: { $in: allPostsIdOfBlogger.map((e) => e._id.toString()) },
    });

    const allCommentsOfBloggerOnPages = await this.CommentModel.find({
      postId: { $in: allPostsIdOfBlogger.map((e) => e._id.toString()) },
    })
      .skip((+paramsOfElems.pageNumber - 1) * +paramsOfElems.pageSize)
      .limit(+paramsOfElems.pageSize)
      .sort(paramsOfElems.paramSort)
      .lean();

    const allCommentsOfBlogger = await Promise.all(
      allCommentsOfBloggerOnPages.map(async (p) =>
        modifyCommentsOfBlogger(
          p,
          userId,
          this.likesInfoQueryRepository,
          this.postsQueryRepository,
        ),
      ),
    );

    return {
      pagesCount: Math.ceil(
        countAllCommentsOfBlogger / +paramsOfElems.pageSize,
      ),
      page: +paramsOfElems.pageNumber,
      pageSize: +paramsOfElems.pageSize,
      totalCount: countAllCommentsOfBlogger,
      items: allCommentsOfBlogger,
    };
  }

  async getCommentsOfUserDBFormat(
    userId: ObjectId,
  ): Promise<CommentsDBType | null> {
    const comments = await this.CommentModel.find({
      'commentatorInfo.userId': userId,
    }).lean();
    return comments.length ? comments : null; //if length === 0 -> return null
  }
}
