import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';
import { QuizOrmQueryRepository } from '../../../features/quiz/infrastructure/typeORM/query.repository/quiz/quiz-orm.query.repository';

@Injectable()
export class IsUserPatricipantInQuizGuard implements CanActivate {
  constructor(protected quizOrmQueryRepository: QuizOrmQueryRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.user?.id) throw new Error('UserId is not found');
    if (!request.params.quizId) throw new Error('QuizId is not found');

    const usersIds = await this.quizOrmQueryRepository.getUsersOfQuizById(
      request.params.quizId,
    );

    if (!usersIds)
      throw new NotFoundException('Quiz with such id is not found');

    if (
      usersIds?.user1Id !== request.user.id &&
      usersIds?.user2Id !== request.user.id
    )
      return false;
    return true;
  }
}
