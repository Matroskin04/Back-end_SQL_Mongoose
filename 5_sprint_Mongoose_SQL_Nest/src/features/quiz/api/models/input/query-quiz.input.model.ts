import { QueryGeneralParams } from '../../../../blogs/api/models/input/queries-blog.input.model';
import { IsIn, ValidateIf } from 'class-validator';

const valuesOfSortingQuizzes = [
  'id',
  'status',
  'pairCreatedDate',
  'startGameDate',
  'finishGameDate',
];

export class QueryQuizInputModel extends QueryGeneralParams {
  @ValidateIf((o) => o.sortBy !== undefined)
  @IsIn(valuesOfSortingQuizzes)
  sortBy?: string;
}
