import { Injectable } from '@nestjs/common';
import { SubscribersOfTgBotRepository } from '../../../infrastructure/repository/subscribers-of-tg-bot.repository';
import { TelegramAdapter } from '../../../../../infrastructure/adapters/telegram.adapter';
import { regexpUUID } from '../../../../../infrastructure/utils/regexp/general-regexp';

@Injectable()
export class StartUseCase {
  constructor(
    protected subscribersOfTgBotRepository: SubscribersOfTgBotRepository,
    protected telegramAdapter: TelegramAdapter,
  ) {}

  async execute(msgText: string, userTgId): Promise<void> {
    const code = msgText.slice(12);
    let result = false;
    if (regexpUUID.test(code)) {
      result =
        await this.subscribersOfTgBotRepository.activateSubscriptionToTgBot(
          code,
          userTgId,
        );
    }
    if (!result) {
      await this.telegramAdapter.sendMessage(
        'Oops, it seems, I your code is incorrect, try one more time, please',
        userTgId,
      );
    } else {
      await this.telegramAdapter.sendMessage(
        `Great! Now I will notify you about all new blog posts that you have subscribed to`,
        userTgId,
      );
    }
  }
}
