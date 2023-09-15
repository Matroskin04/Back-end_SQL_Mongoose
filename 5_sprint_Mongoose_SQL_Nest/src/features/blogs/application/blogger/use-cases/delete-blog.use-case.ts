import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../infrastructure/SQL/repository/blogs.repository';
import { UsersQueryRepository } from '../../../../users/infrastructure/SQL/query.repository/users.query.repository';
import { BodyBlogType } from '../../../infrastructure/SQL/repository/blogs-blogger.types.repositories';
import { CreateBlogDTO } from '../dto/create-blog.dto';
import { BlogsOrmRepository } from '../../../infrastructure/typeORM/repository/blogs-orm.repository';

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(protected blogsOrmRepository: BlogsOrmRepository) {}

  async execute(command: DeleteBlogCommand): Promise<boolean> {
    const { id } = command;

    return this.blogsOrmRepository.deleteSingleBlog(id);
  }
}
