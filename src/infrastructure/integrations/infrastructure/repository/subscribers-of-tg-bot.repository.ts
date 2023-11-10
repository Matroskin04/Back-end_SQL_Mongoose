import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v4 as uuidv4 } from 'uuid';
import { SubscribersOfTgBot } from '../../domain/subscribers-of-tg-bot.entity';
import { Repository } from 'typeorm';

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
    console.log(result);
    return result;
  }
}
