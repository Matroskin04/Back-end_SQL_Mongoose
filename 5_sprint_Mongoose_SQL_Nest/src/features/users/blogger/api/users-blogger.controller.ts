import { SkipThrottle } from '@nestjs/throttler';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAccessGuard } from '../../../../infrastructure/guards/authorization-guards/jwt-access.guard';
import { UpdateBanInfoOfUserInputModel } from './models/input/update-ban-info-of-user.input.model';
import { UsersBloggerService } from '../application/users-blogger.service';
import { UsersBloggerQueryRepository } from '../infrastructure/query.repository/users-blogger.query.repository';
import { QueryUsersBloggerInputModel } from './models/input/query-users-blogger.input.model';
import { BlogOwnerByIdGuard } from '../../../../infrastructure/guards/blog-owner-by-id.guard';

@SkipThrottle()
@Controller('/hometask-nest/blogger/users')
export class UsersBloggerController {
  constructor(
    protected usersBloggerService: UsersBloggerService,
    protected usersBloggerQueryRepository: UsersBloggerQueryRepository,
  ) {}

  @UseGuards(JwtAccessGuard, BlogOwnerByIdGuard)
  @Get('/blog/:blogId')
  async getBannedUsersOfBlog(
    @Query() query: QueryUsersBloggerInputModel,
    @Param('blogId') blogId: string,
  ) {
    const result = await this.usersBloggerQueryRepository.getBannedUsersOfBlog(
      query,
      blogId,
    );
    if (result) return result;
    throw new NotFoundException('Info is not found');
  }

  @UseGuards(JwtAccessGuard, BlogOwnerByIdGuard)
  @HttpCode(204)
  @Put(':userId/ban')
  async updateBanInfoOfUser(
    @Param('userId') userId: string,
    @Body() inputBanInfoModel: UpdateBanInfoOfUserInputModel,
  ) {
    await this.usersBloggerService.updateBanInfoOfUser(
      userId,
      inputBanInfoModel,
    );
    return;
  }
}
