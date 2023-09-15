import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../infrastructure/SQL/repository/blogs.repository';
import { UsersQueryRepository } from '../../../../users/infrastructure/SQL/query.repository/users.query.repository';
import { BodyBlogType } from '../../../infrastructure/SQL/repository/blogs-blogger.types.repositories';
import { CreateBlogDTO } from '../dto/create-blog.dto';

export class DeleteBlogCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(protected blogsRepository: BlogsRepository) {}

  async execute(command: DeleteBlogCommand): Promise<boolean> {
    const { id } = command;

    return this.blogsRepository.deleteSingleBlog(id);
  }
}
