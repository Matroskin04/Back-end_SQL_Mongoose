import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../public/infrastructure/repository/users.repository';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(protected usersRepository: UsersRepository) {}

  execute(command: DeleteUserCommand): Promise<boolean> {
    const { userId } = command;
    return this.usersRepository.deleteUserById(userId);
  }
}
