import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TestingController } from './api/testing.controller';
import { TestingRepository } from './repository/testing.repository';

@Module({
  imports: [CqrsModule],
  controllers: [TestingController],
  providers: [TestingRepository],
})
export class TestingModule {}
