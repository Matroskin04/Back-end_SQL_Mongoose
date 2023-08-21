import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { PostsQueryRepository } from '../../../posts/infrastructure/query.repository/posts.query.repository';
import { CommentViewType } from '../repository/comments.types.repositories';
import { InjectModel } from '@nestjs/mongoose';
import { CommentModelType } from '../../domain/comments.db.types';
import { QueryPostInputModel } from '../../../posts/api/models/input/query-post.input.model';
import { variablesForReturn } from '../../../../infrastructure/utils/functions/variables-for-return.function';
import {
  modifyComment,
  modifyCommentsOfBlogger,
  modifyCommentsOfPost,
} from '../../../../infrastructure/utils/functions/features/comments.functions.helpers';
import {
  CommentOfPostPaginationType,
  CommentsDBType,
  CommentsOfBloggerPaginationType,
  StatusOfLike,
} from './comments.types.query.repository';
import { Comment } from '../../domain/comments.entity';
import { LikesInfoQueryRepository } from '../../../likes-info/infrastructure/query.repository/likes-info.query.repository';
import { BlogsBloggerQueryRepository } from '../../../blogs/blogger-blogs/infrastructure/query.repository/blogs-blogger.query.repository';
import { Post } from '../../../posts/domain/posts.entity';
import { PostModelType } from '../../../posts/domain/posts.db.types';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    protected postsQueryRepository: PostsQueryRepository,
    protected likesInfoQueryRepository: LikesInfoQueryRepository,
    protected blogsBloggerQueryRepository: BlogsBloggerQueryRepository,
  ) {}

  async getCommentById(
    commentId: string,
    userId: ObjectId | null,
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

    return modifyComment(comment, myStatus);
  }

  async getCommentsOfPost(
    postId: string,
    query: QueryPostInputModel,
    userId: ObjectId | null,
  ): Promise<CommentOfPostPaginationType | null> {
    const post = await this.postsQueryRepository.getPostById(
      new ObjectId(postId),
      userId,
    );
    if (!post) {
      return null;
    }

    const paramsOfElems = await variablesForReturn(query);
    const countAllCommentsOfPost = await this.CommentModel.countDocuments({
      postId: postId,
    });

    const allCommentsOfPostOnPages = await this.CommentModel.find({
      postId: postId,
    })
      .skip((+paramsOfElems.pageNumber - 1) * +paramsOfElems.pageSize)
      .limit(+paramsOfElems.pageSize)
      .sort(paramsOfElems.paramSort)
      .lean();

    const allCommentsOfPost = await Promise.all(
      allCommentsOfPostOnPages.map(async (p) =>
        modifyCommentsOfPost(p, userId, this.likesInfoQueryRepository),
      ),
    );

    return {
      pagesCount: Math.ceil(countAllCommentsOfPost / +paramsOfElems.pageSize),
      page: +paramsOfElems.pageNumber,
      pageSize: +paramsOfElems.pageSize,
      totalCount: countAllCommentsOfPost,
      items: allCommentsOfPost,
    };
  }

  async getCommentsOfBlogger(
    query: QueryPostInputModel,
    userId: ObjectId,
  ): Promise<CommentsOfBloggerPaginationType | null> {
    const paramsOfElems = await variablesForReturn(query);

    const allBlogsIdOfBlogger =
      await this.blogsBloggerQueryRepository.getAllBlogsIdOfBlogger(
        userId.toString(),
      );

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
