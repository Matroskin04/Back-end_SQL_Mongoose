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
import { UsersBloggerService } from '../../application/blogger/users-blogger.service';
import { QueryUsersBloggerInputModel } from './models/input/query-users-blogger.input.model';
import { BlogOwnerByIdGuard } from '../../../../infrastructure/guards/blog-owner-by-id.guard';
import { UsersQueryRepository } from '../../infrastructure/query.repository/users.query.repository';

@SkipThrottle()
@Controller('/hometask-nest/blogger/users')
export class UsersBloggerController {
  constructor(
    protected usersBloggerService: UsersBloggerService,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  @UseGuards(JwtAccessGuard, BlogOwnerByIdGuard)
  @Get('/blog/:blogId')
  async getBannedUsersOfBlog(
    @Query() query: QueryUsersBloggerInputModel,
    @Param('blogId') blogId: string,
  ) {
    const result = await this.usersQueryRepository.getBannedUsersOfBlogView(
      query,
      blogId,
    );
    if (!result) throw new NotFoundException('Info is not found');
    return result;
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
