import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../../../features/blogs/infrastructure/SQL/query.repository/blogs.query.repository';
import { PostsQueryRepository } from '../../../features/posts/infrastructure/SQL/query.repository/posts.query.repository';
import { BlogsOrmQueryRepository } from '../../../features/blogs/infrastructure/typeORM/query.repository/blogs-orm.query.repository';
import { PostsOrmQueryRepository } from '../../../features/posts/infrastructure/typeORM/query.repository/posts-orm.query.repository';

@Injectable()
export class IsUserBannedForBlogGuard implements CanActivate {
  constructor(
    protected blogsOrmQueryRepository: BlogsOrmQueryRepository,
    protected postsOrmQueryRepository: PostsOrmQueryRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.params.postId)
      throw new Error('Post Id in params is not found');

    const post = await this.postsOrmQueryRepository.getPostDBInfoById(
      request.params.postId,
    );
    if (!post) throw new NotFoundException('Post is not found');

    if (!request.user?.id) throw new Error('User Id is not found');

    const isUserBanned = await this.blogsOrmQueryRepository.isUserBannedForBlog(
      request.user.id,
      post.blogId,
    );
    return !isUserBanned;
  }
}
