import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BodyBlogType } from '../../../infrastructure/SQL/repository/blogs-blogger.types.repositories';
import { CreateBlogDTO } from '../dto/create-blog.dto';
import { UsersOrmQueryRepository } from '../../../../users/infrastructure/typeORM/query.repository/users-orm.query.repository';
import { BlogsOrmRepository } from '../../../infrastructure/typeORM/repository/blogs-orm.repository';
import { modifyBlogIntoViewGeneralModel } from '../../../../../infrastructure/utils/functions/features/blog.functions.helpers';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../../../../configuration/configuration';
import { BlogsOrmQueryRepository } from '../../../infrastructure/typeORM/query.repository/blogs-orm.query.repository';

export class SubscribeToBlogCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(SubscribeToBlogCommand)
export class SubscribeToBlogUseCase
  implements ICommandHandler<SubscribeToBlogCommand>
{
  constructor(
    protected blogsOrmRepository: BlogsOrmRepository,
    protected blogsOrmQueryRepository: BlogsOrmQueryRepository,
  ) {}

  async execute(command: SubscribeToBlogCommand): Promise<boolean> {
    const { blogId, userId } = command;

    const doesBlogExist = this.blogsOrmQueryRepository.doesBlogExist(blogId);
    if (!doesBlogExist) return false;

    await this.blogsOrmRepository.subscribeToBlog(blogId, userId);
    return true;
  }
}
