import {
  Injectable,
  CanActivate,
  ExecutionContext,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { QuizOrmQueryRepository } from '../../../features/quiz/infrastructure/typeORM/query.repository/quiz/quiz-orm.query.repository';
import { createBodyErrorBadRequest } from '../../utils/functions/create-error-bad-request.function';

@Injectable()
export class IsUserParticipantInQuizGuard implements CanActivate {
  constructor(protected quizOrmQueryRepository: QuizOrmQueryRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.user?.id) throw new Error('UserId is not found');
    if (!request.params.quizId) throw new Error('QuizId is not found');

    //todo create like separate decorator? where?
    if (
      !/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.test(
        request.params.quizId,
      )
    )
      throw new BadRequestException(
        createBodyErrorBadRequest('Id has invalid format', 'quizId'),
      );

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
