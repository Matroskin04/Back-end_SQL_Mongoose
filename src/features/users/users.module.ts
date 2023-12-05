import { forwardRef, Module } from '@nestjs/common';
import { UsersSaController } from './api/sa/users-sa.controller';
import { UsersBloggerController } from './api/blogger/users-blogger.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersRepository } from './infrastructure/SQL/repository/users.repository';
import { UsersOrmRepository } from './infrastructure/typeORM/repository/users-orm.repository';
import { CreateUserUseCase } from './application/sa/use-cases/create-user.use-case';
import { UpdateBanInfoOfUserUseCase } from './application/sa/use-cases/update-ban-info-of-user.use-case';
import { UpdateUserBanInfoForBlogUseCase } from './application/blogger/use-cases/update-user-ban-info-for-blog.use-case';
import { DeleteUserUseCase } from './application/sa/use-cases/delete-user.use-case';
import { Users } from './domain/users.entity';
import { UsersPasswordRecovery } from './domain/users-password-recovery.entity';
import { UsersEmailConfirmation } from './domain/users-email-confirmation.entity';
import { UsersBanInfo } from './domain/users-ban-info.entity';
import { UsersQueryRepository } from './infrastructure/SQL/query.repository/users.query.repository';
import { UsersOrmQueryRepository } from './infrastructure/typeORM/query.repository/users-orm.query.repository';
import { CryptoAdapter } from '../../infrastructure/adapters/crypto.adapter';
import { UserBanInfoOrmRepository } from './infrastructure/typeORM/subrepository/ban-info-orm.public.repository';
import { BannedUsersOfBlog } from '../blogs/domain/banned-users-of-blog.entity';
import { BlogsModule } from '../blogs/blogs.module';
import { DevicesModule } from '../devices/devices.module';
import { AuthModule } from '../auth/auth.module';

const entities = [
  Users,
  UsersPasswordRecovery,
  UsersEmailConfirmation,
  UsersBanInfo,
  BannedUsersOfBlog,
];
const queryRepositories = [UsersQueryRepository, UsersOrmQueryRepository];
const repositories = [
  UsersRepository,
  UsersOrmRepository,
  UserBanInfoOrmRepository,
];
const useCases = [
  CreateUserUseCase,
  UpdateBanInfoOfUserUseCase,
  UpdateUserBanInfoForBlogUseCase,
  DeleteUserUseCase,
];
@Module({
  imports: [
    TypeOrmModule.forFeature([...entities]),
    DevicesModule,
    forwardRef(() => BlogsModule),
    forwardRef(() => AuthModule),
    CqrsModule,
  ],
  controllers: [UsersSaController, UsersBloggerController],
  providers: [
    ...useCases,
    ...repositories,
    ...queryRepositories,
    CryptoAdapter,
  ],
  exports: [TypeOrmModule, UsersOrmQueryRepository, UsersOrmRepository],
})
export class UsersModule {}
