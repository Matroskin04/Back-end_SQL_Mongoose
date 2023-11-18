import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SubscribersOfTgBotRepository } from '../infrastructure/repository/subscribers-of-tg-bot.repository';
import { JwtAccessGuard } from '../../../infrastructure/guards/authorization-guards/jwt-access.guard';
import { CurrentUserId } from '../../../infrastructure/decorators/current-user-id.param.decorator';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';
import { CommandBus } from '@nestjs/cqrs';
import { HandleTelegramUpdatesCommand } from '../application/use-cases/handle-telegram-updates.use-case';
import { TelegramMessageInputModel } from './models/input/telegram-messsage.input.model';

@Controller('/api/integrations/telegram')
export class TelegramController {
  constructor(
    protected subscribersOfTgBotRepository: SubscribersOfTgBotRepository,
    protected commandBus: CommandBus,
  ) {}

  @UseGuards(JwtAccessGuard)
  @Get('auth-bot-link')
  async getBotLink(@CurrentUserId() userId: string) {
    const result =
      await this.subscribersOfTgBotRepository.saveSubscriberInfoOfTgBot(userId);
    return {
      link: 'https://t.me/content_platform_bot?code=' + result.codeConfirmation,
    };
  }

  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Post('webhook')
  forTelegramHook(@Body() payload: TelegramMessageInputModel): void {
    console.log(payload);
    //todo async await is not needed?
    this.commandBus.execute(new HandleTelegramUpdatesCommand(payload));
    return;
  }
}
