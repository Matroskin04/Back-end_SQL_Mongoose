import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SubscribersOfTgBotRepository } from '../infrastructure/repository/subscribers-of-tg-bot.repository';
import { JwtAccessGuard } from '../../guards/authorization-guards/jwt-access.guard';
import { CurrentUserId } from '../../decorators/current-user-id.param.decorator';

@Controller('/api/integrations/telegram')
export class TelegramController {
  constructor(
    protected subscribersOfTgBotRepository: SubscribersOfTgBotRepository,
  ) {}

  @UseGuards(JwtAccessGuard)
  @Get('auto-bot-link')
  async getBotLink(@CurrentUserId() userId: string) {
    const result =
      await this.subscribersOfTgBotRepository.saveSubscriberInfoOfTgBot(userId);
    return {
      link:
        'https://t.me/content_platform_bot/?code=' + result.codeConfirmation,
    };
  }
}
