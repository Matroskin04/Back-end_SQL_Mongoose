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

export class UpdatePostCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public postDTO: BodyPostByBlogIdType,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    protected blogsOrmQueryRepository: BlogsOrmQueryRepository,
    protected postsOrmRepository: PostsOrmRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<boolean> {
    const { postDTO, postId, blogId } = command;

    const doesBlogExist = await this.blogsOrmQueryRepository.doesBlogExist(
      blogId,
    );
    if (!doesBlogExist) return false;

    return this.postsOrmRepository.updatePost(postDTO, postId);
  }
}
