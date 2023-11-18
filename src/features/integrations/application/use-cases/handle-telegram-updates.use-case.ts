import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TelegramMessageDtoType } from '../dto/telegram-message-type';
import { SubscribersOfTgBotRepository } from '../../infrastructure/repository/subscribers-of-tg-bot.repository';
import { TelegramAdapter } from '../../../../infrastructure/adapters/telegram.adapter';
import { StartUseCase } from './sub-use-cases/start.use-case';

export class HandleTelegramUpdatesCommand {
  constructor(public messageInfo: TelegramMessageDtoType) {}
}

@CommandHandler(HandleTelegramUpdatesCommand)
export class HandleTelegramUpdatesUseCase
  implements ICommandHandler<HandleTelegramUpdatesCommand>
{
  constructor(protected startUseCase: StartUseCase) {}

  async execute(command: HandleTelegramUpdatesCommand): Promise<any> {
    const { message } = command.messageInfo;
    if (!message) return;

    const userTgId = message.from.id;
    if (/^\/start code=/.test(message.text)) {
      this.startUseCase.execute(message.text, userTgId);
    }
  }
}
