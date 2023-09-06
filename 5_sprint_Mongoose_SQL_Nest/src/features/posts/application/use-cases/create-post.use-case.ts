import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BodyPostByBlogIdType,
  PostTypeWithId,
} from '../../infrastructure/repository/posts.types.repositories';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/query.repository/blogs.query.repository';
import { modifyPostIntoInitialViewModel } from '../../../../infrastructure/utils/functions/features/posts.functions.helpers';
import { PostsRepository } from '../../infrastructure/repository/posts.repository';

export class CreatePostCommand {
  constructor(
    public blogId: string,
    public userId: string,
    public postDTO: BodyPostByBlogIdType,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    protected blogsPublicQueryRepository: BlogsQueryRepository,
    protected postsRepository: PostsRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<null | PostTypeWithId> {
    const { postDTO, userId, blogId } = command;

    //checking the existence of a blog
    const blog = await this.blogsPublicQueryRepository.getBlogAllInfoById(
      blogId,
    );
    if (!blog) {
      return null;
    }

    const post = await this.postsRepository.createPost(postDTO, blogId, userId);

    const postMapped = modifyPostIntoInitialViewModel(
      post,
      blog.name,
      [],
      'None',
    );

    return postMapped;
  }
}
