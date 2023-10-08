import { QueryGeneralParams } from '../../../../blogs/api/models/input/queries-blog.input.model';
import {
  IsIn,
  IsNumber,
  IsPositive,
  Matches,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

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

export class QueryStatisticInputModel extends QueryGeneralParams {
  sort?: string;

  @ValidateIf((o) => o.pageNumber !== undefined)
  @Transform(({ value }) => +value)
  @IsPositive()
  @IsNumber()
  pageNumber?: string;

  @ValidateIf((o) => o.pageSize !== undefined)
  @Transform(({ value }) => +value)
  @IsPositive()
  @IsNumber()
  pageSize?: string;
}
