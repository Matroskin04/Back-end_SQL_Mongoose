import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../infrastructure/SQL/repository/blogs.repository';
import { UsersQueryRepository } from '../../../../users/infrastructure/SQL/query.repository/users.query.repository';
import { BodyBlogType } from '../../../infrastructure/SQL/repository/blogs-blogger.types.repositories';
import { CreateBlogDTO } from '../dto/create-blog.dto';
import { BlogsOrmRepository } from '../../../infrastructure/typeORM/repository/blogs-orm.repository';

export class UpdateBlogCommand {
  constructor(public blogDTO: BodyBlogType, public id: string) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(protected blogsOrmRepository: BlogsOrmRepository) {}

  async execute(command: UpdateBlogCommand): Promise<boolean> {
    const { blogDTO, id } = command;
    return this.blogsOrmRepository.updateBlog(blogDTO, id);
  }
}
