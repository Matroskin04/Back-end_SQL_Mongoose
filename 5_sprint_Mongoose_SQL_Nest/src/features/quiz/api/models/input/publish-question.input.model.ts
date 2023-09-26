import { IsBoolean } from 'class-validator';

export class PublishQuestionUseCase {
  @IsBoolean({ message: 'Value should be true or false' })
  published: boolean;
}
