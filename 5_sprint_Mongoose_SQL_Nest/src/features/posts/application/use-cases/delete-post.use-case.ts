import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BodyPostByBlogIdType,
  PostTypeWithId,
} from '../../infrastructure/SQL/repository/posts.types.repositories';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/SQL/query.repository/blogs.query.repository';
import { modifyPostIntoInitialViewModel } from '../../../../infrastructure/utils/functions/features/posts.functions.helpers';
import { PostsRepository } from '../../infrastructure/SQL/repository/posts.repository';
import { PostsOrmRepository } from '../../infrastructure/typeORM/repository/posts-orm.repository';

export class DeletePostCommand {
  constructor(public postId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(protected postsOrmRepository: PostsOrmRepository) {}

  async execute(command: DeletePostCommand): Promise<boolean> {
    const { postId } = command;
    return this.postsOrmRepository.deleteSinglePost(postId);
  }
}
