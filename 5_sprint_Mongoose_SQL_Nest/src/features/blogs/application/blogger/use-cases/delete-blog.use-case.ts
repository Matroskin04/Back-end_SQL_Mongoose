import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
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
