import { QueryGeneralParams } from '../../../../blogs/api/models/input/queries-blog.input.model';
import { IsEnum, IsIn, ValidateIf } from 'class-validator';
import { PublishedStatusType } from '../../../../../infrastructure/types/quiz-questions.general.types';

const valuesOfSortingQuestions = [
  'id',
  'body',
  'correctAnswers',
  'createdAt',
  'updatedAt',
  'published',
];

export class QueryQuestionsInputModel extends QueryGeneralParams {
  @ValidateIf((o) => o.sortBy !== undefined)
  @IsIn(valuesOfSortingQuestions)
  @ValidateIf((o) => o.sortBy !== undefined)
  sortBy?: string;

  @IsIn(['all', 'published', 'notPublished'], {
    message: 'The value should be one of these: all, published, notPublished',
  })
  @ValidateIf((o) => o.publishedStatus !== undefined)
  publishedStatus?: PublishedStatusType;

  bodySearchTerm?: string;
}
