import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TestingController } from '../testing/api/testing.controller';
import { TestingRepository } from '../testing/repository/testing.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HandleTelegramUpdatesUseCase } from './application/use-cases/handle-telegram-updates.use-case';
import { StartUseCase } from './application/use-cases/sub-use-cases/start.use-case';
import { S3StorageAdapter } from '../../infrastructure/adapters/s3-storage.adapter';
import { TelegramAdapter } from '../../infrastructure/adapters/telegram.adapter';
import { TelegramController } from './api/telegram.controller';
import { SubscribersOfTgBotRepository } from './infrastructure/repository/subscribers-of-tg-bot.repository';
import { SubscribersOfTgBot } from './domain/subscribers-of-tg-bot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubscribersOfTgBot]), CqrsModule],
  controllers: [TelegramController],
  providers: [
    HandleTelegramUpdatesUseCase,
    StartUseCase,

    S3StorageAdapter,
    TelegramAdapter,

    SubscribersOfTgBotRepository,
  ],
  exports: [TypeOrmModule],
})
export class IntegrationsModule {}
