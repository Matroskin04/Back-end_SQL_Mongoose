import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryUsersSAInputModel } from './models/input/query-users-sa.input.model';
import {
  ViewAllUsersModels,
  UserOutputModel,
} from './models/output/user.output.model';
import { CreateUserInputModel } from './models/input/create-user.input.model';
import { UsersQueryRepository } from '../../infrastructure/SQL/query.repository/users.query.repository';
import { HTTP_STATUS_CODE } from '../../../../infrastructure/utils/enums/http-status.enums';
import { BasicAuthGuard } from '../../../../infrastructure/guards/authorization-guards/basic-auth.guard';
import { SkipThrottle } from '@nestjs/throttler';
import { UpdateBanInfoOfUserInputModel } from './models/input/update-ban-info-of-user.input.model';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../../application/sa/use-cases/create-user.use-case';
import { DeleteUserCommand } from '../../application/sa/use-cases/delete-user.use-case';
import { UpdateBanInfoOfUserCommand } from '../../application/sa/use-cases/update-ban-info-of-user.use-case';
import { UsersOrmQueryRepository } from '../../infrastructure/typeORM/query.repository/users-orm.query.repository';

@Controller('/hometask-nest/sa/users')
export class UsersSaController {
  constructor(
    protected commandBus: CommandBus,
    protected usersOrmQueryRepository: UsersOrmQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getAllUsers(
    @Query() query: QueryUsersSAInputModel,
  ): Promise<ViewAllUsersModels> {
    const result = await this.usersOrmQueryRepository.getAllUsersView(query);
    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createUser(
    @Body() inputUserModel: CreateUserInputModel,
  ): Promise<UserOutputModel> {
    const result = await this.commandBus.execute(
      new CreateUserCommand(inputUserModel),
    );
    return result;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Put(':id/ban')
  async updateBanInfoOfUser(
    @Param('id') userId: string,
    @Body() inputBanInfo: UpdateBanInfoOfUserInputModel,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new UpdateBanInfoOfUserCommand(userId, inputBanInfo),
    );
    if (!result) throw new NotFoundException('User is not found');
    return;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Delete(':id')
  async deleteUser(@Param('id') userId: string): Promise<void> {
    const result = await this.commandBus.execute(new DeleteUserCommand(userId));

    if (!result) throw new NotFoundException('User is not found');
    return;
  }
}
