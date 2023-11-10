import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BodyBlogType } from '../../../infrastructure/SQL/repository/blogs-blogger.types.repositories';
import { CreateBlogDTO } from '../dto/create-blog.dto';
import { UsersOrmQueryRepository } from '../../../../users/infrastructure/typeORM/query.repository/users-orm.query.repository';
import { BlogsOrmRepository } from '../../../infrastructure/typeORM/repository/blogs-orm.repository';
import { modifyBlogIntoViewGeneralModel } from '../../../../../infrastructure/utils/functions/features/blog.functions.helpers';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../../../../configuration/configuration';
import { BlogsOrmQueryRepository } from '../../../infrastructure/typeORM/query.repository/blogs-orm.query.repository';
import { SubscriptionsBlogOrmRepository } from '../../../infrastructure/typeORM/subrepositories/subscription-blog-orm.repository';

export class UnsubscribeFromBlogCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(UnsubscribeFromBlogCommand)
export class UnsubscribeFromBlogUseCase
  implements ICommandHandler<UnsubscribeFromBlogCommand>
{
  constructor(
    protected subscriptionsBlogOrmRepository: SubscriptionsBlogOrmRepository,
  ) {}

  async execute(command: UnsubscribeFromBlogCommand): Promise<boolean> {
    const { blogId, userId } = command;

    const result =
      await this.subscriptionsBlogOrmRepository.unsubscribeFromBlog(
        blogId,
        userId,
      );
    return result;
  }
}
