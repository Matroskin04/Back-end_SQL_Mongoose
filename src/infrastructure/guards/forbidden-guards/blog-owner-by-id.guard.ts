import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { BlogsQueryRepository } from '../../../features/blogs/infrastructure/SQL/query.repository/blogs.query.repository';
import { regexpUUID } from '../../utils/regexp/general-regexp';
import { createBodyErrorBadRequest } from '../../utils/functions/create-error-bad-request.function';
import { checkIdFormatAndExistence } from '../../utils/functions/check-id-format-and-existence';

@Injectable()
export class BlogOwnerByIdGuard implements CanActivate {
  constructor(protected blogsPublicQueryRepository: BlogsQueryRepository) {}
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
