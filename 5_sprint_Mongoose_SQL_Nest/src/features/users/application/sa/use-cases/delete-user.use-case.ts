import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersSARepository } from '../../../super-admin/infrastructure/repository/users-sa.repository';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(protected usersSARepository: UsersSARepository) {}

  execute(command: DeleteUserCommand): Promise<boolean> {
    const { userId } = command;
    return this.usersSARepository.deleteUserById(userId);
  }
}
