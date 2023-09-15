import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BodyPostByBlogIdType,
  PostTypeWithId,
} from '../../infrastructure/SQL/repository/posts.types.repositories';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/SQL/query.repository/blogs.query.repository';
import { modifyPostIntoInitialViewModel } from '../../../../infrastructure/utils/functions/features/posts.functions.helpers';
import { PostsRepository } from '../../infrastructure/SQL/repository/posts.repository';
import { PostsOrmRepository } from '../../infrastructure/typeORM/repository/posts-orm.repository';
import { BlogsOrmQueryRepository } from '../../../blogs/infrastructure/typeORM/query.repository/blogs-orm.query.repository';

export class DeletePostCommand {
  constructor(public postId: string, public blogId: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    protected postsOrmRepository: PostsOrmRepository,
    protected blogsOrmQueryRepository: BlogsOrmQueryRepository,
  ) {}

  async execute(command: DeletePostCommand): Promise<boolean> {
    const { postId, blogId } = command;

    const doesBlogExist = await this.blogsOrmQueryRepository.doesBlogExist(
      blogId,
    );
    if (!doesBlogExist) return false;

    return this.postsOrmRepository.deleteSinglePost(postId);
  }
}
