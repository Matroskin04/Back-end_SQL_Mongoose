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
import { CommandBus } from '@nestjs/cqrs';
import { UpdateBanInfoOfUserCommand } from '../../application/sa/use-cases/update-ban-info-of-user.use-case';
import {
  UpdateUserBanInfoForBlogCommand,
  UpdateUserBanInfoForBlogUseCase,
} from '../../application/blogger/use-cases/update-user-ban-info-for-blog.use-case';

@SkipThrottle()
@Controller('/hometask-nest/blogger/users')
export class UsersBloggerController {
  constructor(
    protected commandBus: CommandBus,
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
    await this.commandBus.execute(
      new UpdateUserBanInfoForBlogCommand(userId, inputBanInfoModel),
    );
    return;
  }
}
