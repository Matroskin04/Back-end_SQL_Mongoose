import { Posts } from '../../features/posts/domain/posts.entity';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
} from 'typeorm';
import { Injectable } from '@nestjs/common';
import { SubscribersOfTgBotRepository } from '../../features/integrations/infrastructure/repository/subscribers-of-tg-bot.repository';
import { TelegramAdapter } from '../adapters/telegram.adapter';

@Injectable()
@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Posts> {
  constructor(
    protected connection: DataSource,
    protected subscribersOfTgBotRepo: SubscribersOfTgBotRepository,
    protected telegramAdapter: TelegramAdapter,
  ) {
    connection.subscribers.push(this);
  }
  //Indicates that this subscriber only listen to Post events.
  listenTo(): typeof Posts {
    return Posts;
  }

  //Called after post insertion.
  afterInsert = async (event: InsertEvent<Posts>): Promise<any> => {
    const allSubscribers =
      await this.subscribersOfTgBotRepo.getAllSubscribersOfBlogAndTgBot(
        event.entity.blogId,
      );
    //todo is it normal?
    for (const subscriber of allSubscribers) {
      this.telegramAdapter.sendMessage(
        `New post published for blog: "${subscriber.blogName}"`,
        subscriber.telegramId,
      );
    }
  };
}
