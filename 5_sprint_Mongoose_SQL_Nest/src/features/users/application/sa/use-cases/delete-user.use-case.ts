import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/SQL/repository/users.repository';
import { UsersOrmRepository } from '../../../infrastructure/typeORM/repository/users-orm.repository';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(protected usersOrmRepository: UsersOrmRepository) {}

  execute(command: DeleteUserCommand): Promise<boolean> {
    const { userId } = command;
    return this.usersOrmRepository.deleteUserById(userId);
  }
}
