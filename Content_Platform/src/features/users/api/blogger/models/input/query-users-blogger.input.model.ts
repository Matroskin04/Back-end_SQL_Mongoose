import { QueryGeneralParams } from '../../../../../blogs/api/models/input/queries-blog.input.model';
import { IsIn, ValidateIf } from 'class-validator';

const valuesOfSortingUsers = [
  'id',
  'login',
  'isBanned',
  'banReason',
  'banDate',
];

export class QueryUsersBloggerInputModel extends QueryGeneralParams {
  searchLoginTerm?: string;

  @ValidateIf((o) => o.sortBy !== undefined)
  @IsIn(valuesOfSortingUsers)
  sortBy?: string;
}
