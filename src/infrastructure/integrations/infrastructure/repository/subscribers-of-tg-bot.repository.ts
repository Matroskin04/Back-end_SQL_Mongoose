import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { SubscribersOfTgBot } from '../../domain/subscribers-of-tg-bot.entity';
import { Repository } from 'typeorm';
import { SubscribersOfBlog } from '../../../../features/blogs/domain/subscribers-of-blog.entity';
import { Blogs } from '../../../../features/blogs/domain/blogs.entity';

@Injectable()
export class SubscribersOfTgBotRepository {
  constructor(
    @InjectRepository(SubscribersOfTgBot)
    protected subscribersOfTgBotRepo: Repository<SubscribersOfTgBot>,
  ) {}

  async saveSubscriberInfoOfTgBot(userId: string) {
    const result = await this.subscribersOfTgBotRepo.save({
      userId,
      codeConfirmation: uuidv4(),
    });
    return result;
  }

  async activateSubscriptionToTgBot(
    codeConfirmation: string,
    telegramId: number,
  ): Promise<boolean> {
    const result = await this.subscribersOfTgBotRepo.update(
      { codeConfirmation },
      { telegramId },
    );
    return result.affected === 1;
  }

  async getAllSubscribersOfBlogAndTgBot(
    blogId: string,
  ): Promise<{ telegramId: number; blogName: string }[]> {
    const query = this.subscribersOfTgBotRepo
      .createQueryBuilder('stg')
      .select(['stg."telegramId"', 'b."name" as "blogName"'])
      .innerJoin(
        SubscribersOfBlog,
        'sb',
        'stg."userId" = sb."userId" AND sb."blogId" = :blogId',
        { blogId },
      )
      .leftJoin('sb.blog', 'b')
      .where('stg."telegramId" IS NOT NULL');

    const result = await query.getRawMany();
    return result;
  }
}
