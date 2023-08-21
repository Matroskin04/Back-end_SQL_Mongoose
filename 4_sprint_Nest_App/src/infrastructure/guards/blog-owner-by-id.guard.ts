import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { NotFoundError } from 'rxjs';
import { BlogsSAQueryRepository } from '../../features/blogs/super-admin-blogs/infrastructure/query.repository/blogs-sa.query.repository';
import { ObjectId } from 'mongodb';

@Injectable()
export class BlogOwnerByIdGuard implements CanActivate {
  constructor(protected blogsSAQueryRepository: BlogsSAQueryRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.user?.id) throw new Error('userId is not found');

    const blog = await this.blogsSAQueryRepository.getBlogById(
      new ObjectId(request.params.blogId ?? request.body.blogId),
    );
    if (!blog) throw new NotFoundException('This blog is not found');

    return blog.blogOwnerInfo.userId === request.user.id;
  }
}
