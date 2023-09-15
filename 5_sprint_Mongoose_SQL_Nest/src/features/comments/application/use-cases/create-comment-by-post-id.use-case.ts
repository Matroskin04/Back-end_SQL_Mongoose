import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from '../../infrastructure/repository/comments.repository';
import { CommentsQueryRepository } from '../../infrastructure/query.repository/comments.query.repository';
import { CommentsLikesRepository } from '../../infrastructure/subrepository/comments-likes.repository';
import { CommentViewType } from '../../infrastructure/repository/comments.types.repositories';
import { modifyCommentIntoInitialViewModel } from '../../../../infrastructure/utils/functions/features/comments.functions.helpers';
import { PostsQueryRepository } from '../../../posts/infrastructure/SQL/query.repository/posts.query.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/SQL/query.repository/users.query.repository';

export class CreateCommentCommand {
  constructor(
    public postId: string,
    public userId: string,
    public content: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    protected commentsRepository: CommentsRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(
    command: CreateCommentCommand,
  ): Promise<null | CommentViewType> {
    const { postId, userId, content } = command;

    const userLogin = await this.usersQueryRepository.getUserLoginById(userId);
    if (!userLogin) {
      return null;
    }

    const post = await this.postsQueryRepository.doesPostExist(postId);
    if (!post) {
      return null;
    }

    const comment = await this.commentsRepository.createComment(
      content,
      userId,
      postId,
    );
    return modifyCommentIntoInitialViewModel(comment, userLogin, 'None');
  }
}
