import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BodyPostByBlogIdType } from '../../infrastructure/SQL/repository/posts.types.repositories';
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
