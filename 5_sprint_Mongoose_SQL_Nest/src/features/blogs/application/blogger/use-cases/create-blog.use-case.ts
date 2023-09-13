import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../infrastructure/repository/blogs.repository';
import { UsersQueryRepository } from '../../../../users/infrastructure/SQL/query.repository/users.query.repository';
import { BodyBlogType } from '../../../infrastructure/repository/blogs-blogger.types.repositories';
import { CreateBlogDTO } from '../dto/create-blog.dto';

export class CreateBlogCommand {
  constructor(public blogDTO: BodyBlogType, public userId: string) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: CreateBlogCommand): Promise<CreateBlogDTO> {
    const { blogDTO, userId } = command;

    const user = await this.usersQueryRepository.getUserLoginById(userId);
    if (!user) throw new Error('User is not found');

    const result = await this.blogsRepository.createBlog(blogDTO, userId);
    return result;
  }
}
