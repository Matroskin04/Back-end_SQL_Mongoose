import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { BannedUsersByBloggerQueryRepository } from '../../../features/users/banned/banned-by-blogger-users/infrastructure/banned-users-by-blogger-query.repository';
import { BlogsPublicQueryRepository } from '../../../features/blogs/public-blogs/infrastructure/query.repository/blogs-public.query.repository';
import { PostsQueryRepository } from '../../../features/posts/infrastructure/query.repository/posts.query.repository';
import { ObjectId } from 'mongodb';

@Injectable()
export class IsUserBannedGuard implements CanActivate {
  constructor(
    protected bannedUsersByBloggerQueryRepository: BannedUsersByBloggerQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.params.postId)
      throw new Error('Post Id in params is not found');

    const post = await this.postsQueryRepository.getPostById(
      new ObjectId(request.params.postId),
      null,
    );
    if (!post) throw new NotFoundException('Post is not found');

    if (!request.user?.id) throw new Error('User Id is not found');
    const bannedUser =
      await this.bannedUsersByBloggerQueryRepository.getBannedUserByBlogger(
        request.user.id.toString(),
        post.blogId,
      );
    return !bannedUser;
  }
}
