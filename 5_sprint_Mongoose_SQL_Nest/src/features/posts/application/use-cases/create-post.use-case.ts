import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BodyPostByBlogIdType,
  PostTypeWithId,
} from '../../infrastructure/SQL/repository/posts.types.repositories';
import { modifyPostIntoInitialViewModel } from '../../../../infrastructure/utils/functions/features/posts.functions.helpers';
import { BlogsOrmQueryRepository } from '../../../blogs/infrastructure/typeORM/query.repository/blogs-orm.query.repository';
import { PostsOrmRepository } from '../../infrastructure/typeORM/repository/posts-orm.repository';

export class CreatePostCommand {
  constructor(
    public blogId: string,
    public userId: string | null,
    public postDTO: BodyPostByBlogIdType,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    protected blogsOrmQueryRepository: BlogsOrmQueryRepository,
    protected postsOrmRepository: PostsOrmRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<null | PostTypeWithId> {
    const { postDTO, userId, blogId } = command;

    //checking the existence of a blog
    const blog = await this.blogsOrmQueryRepository.getBlogAllInfoById(blogId);
    if (!blog) {
      return null;
    }

    const post = await this.postsOrmRepository.createPost(
      postDTO,
      blogId,
      userId,
    );

    const postMapped = modifyPostIntoInitialViewModel(
      post,
      blog.name,
      [],
      'None',
    );

    return postMapped;
  }
}
