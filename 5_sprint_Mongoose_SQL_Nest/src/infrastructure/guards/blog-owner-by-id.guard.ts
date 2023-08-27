import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { BlogsQueryRepository } from '../../features/blogs/infrastructure/query.repository/blogs.query.repository';

@Injectable()
export class BlogOwnerByIdGuardMongo implements CanActivate {
  constructor(protected blogsPublicQueryRepository: BlogsQueryRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.user?.id) throw new Error('userId is not found');

    const blog = await this.blogsPublicQueryRepository.getBlogByIdMongo(
      new ObjectId(request.params.blogId ?? request.body.blogId),
    );
    if (!blog) throw new NotFoundException('This blog is not found');

    return blog.blogOwnerInfo.userId === request.user.id;
  }
}

@Injectable()
export class BlogOwnerByIdGuard implements CanActivate {
  constructor(protected blogsPublicQueryRepository: BlogsQueryRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (!request.user?.id) throw new Error('userId is not found');

    const blog = await this.blogsPublicQueryRepository.getBlogAllInfoById(
      request.params.blogId ?? request.body.blogId,
    );
    if (!blog) throw new NotFoundException('This blog is not found');

    return blog.userId === request.user.id;
  }
}
