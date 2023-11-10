import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SubscribersOfBlog } from '../../../domain/subscribers-of-blog.entity';

@Injectable()
export class SubscriptionsBlogOrmRepository {
  constructor(
    @InjectRepository(SubscribersOfBlog)
    protected subscribersOfBlogRepository: Repository<SubscribersOfBlog>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async subscribeToBlog(blogId: string, userId: string): Promise<void> {
    const result = await this.subscribersOfBlogRepository.insert({
      blogId,
      userId,
    });
    return;
  }
}
