import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../../../features/blogs/infrastructure/SQL/query.repository/blogs.query.repository';
import { PostsQueryRepository } from '../../../features/posts/infrastructure/query.repository/posts.query.repository';

@Injectable()
export class IsUserBannedForBlogGuard implements CanActivate {
  constructor(
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.params.postId)
      throw new Error('Post Id in params is not found');

    const post = await this.postsQueryRepository.getPostDBInfoById(
      request.params.postId,
    );
    if (!post) throw new NotFoundException('Post is not found');

    if (!request.user?.id) throw new Error('User Id is not found');

    const isUserBanned = await this.blogsQueryRepository.isUserBannedForBlog(
      request.user.id,
      post.blogId,
    );
    return !isUserBanned;
  }
}
