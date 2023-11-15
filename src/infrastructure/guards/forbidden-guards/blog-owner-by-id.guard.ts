import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../../../features/blogs/infrastructure/SQL/query.repository/blogs.query.repository';
import { checkIdFormatAndExistence } from '../../utils/functions/check-id-format-and-existence';
import { BlogsOrmQueryRepository } from '../../../features/blogs/infrastructure/typeORM/query.repository/blogs-orm.query.repository';

@Injectable()
export class BlogOwnerByIdGuard implements CanActivate {
  constructor(protected blogsPublicQueryRepository: BlogsOrmQueryRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.user?.id) throw new Error('userId is not found');

    checkIdFormatAndExistence(request.params.blogId ?? request.body.blogId);

    const blog = await this.blogsPublicQueryRepository.getBlogAllInfoById(
      request.params.blogId ?? request.body.blogId,
    );
    if (!blog) throw new NotFoundException('This blog is not found');

    return blog.userId === request.user.id;
  }
}
