import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentViewType } from '../../infrastructure/SQL/repository/comments.types.repositories';
import { modifyCommentIntoInitialViewModel } from '../../../../infrastructure/utils/functions/features/comments.functions.helpers';
import { PostsOrmQueryRepository } from '../../../posts/infrastructure/typeORM/query.repository/posts-orm.query.repository';
import { UsersOrmQueryRepository } from '../../../users/infrastructure/typeORM/query.repository/users-orm.query.repository';
import { CommentsOrmRepository } from '../../infrastructure/typeORM/repository/comments-orm.repository';

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
    protected commentsOrmRepository: CommentsOrmRepository,
    protected postsOrmQueryRepository: PostsOrmQueryRepository,
    protected usersOrmQueryRepository: UsersOrmQueryRepository,
  ) {}

  async execute(
    command: CreateCommentCommand,
  ): Promise<null | CommentViewType> {
    const { postId, userId, content } = command;

    const userLogin = await this.usersOrmQueryRepository.getUserLoginById(
      userId,
    );
    if (!userLogin) {
      return null;
    }
    const post = await this.postsOrmQueryRepository.doesPostExist(postId);
    if (!post) {
      return null;
    }

    const comment = await this.commentsOrmRepository.createComment(
      content,
      userId,
      postId,
    );
    return modifyCommentIntoInitialViewModel(comment, userLogin, 'None');
  }
}
