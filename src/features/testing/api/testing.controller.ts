import { Response } from 'express';
import { TestingRepository } from '../repository/testing.repository';
import { Controller, Delete, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

@SkipThrottle()
@Controller('/hometask-nest/testing/all-data')
export class TestingController {
  constructor(protected testingRepository: TestingRepository) {}

  @Delete()
  async deleteAllData(@Res() res: Response<void>) {
    await this.testingRepository.deleteAllData();
    res.sendStatus(204);
  }
}
