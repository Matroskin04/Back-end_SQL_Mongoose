import { QueryGeneralParams } from '../../../../../blogs/api/models/input/queries-blog.input.model';
import { IsIn, ValidateIf } from 'class-validator';

const valuesOfSortingUsers = [
  'id',
  'login',
  'email',
  'createdAt',
  'isBanned',
  'banReason',
  'banDate',
];
export class QueryUsersSAInputModel extends QueryGeneralParams {
  searchLoginTerm?: string;

  searchEmailTerm?: string;

  @ValidateIf((o) => o.sortBy !== undefined)
  @IsIn(valuesOfSortingUsers)
  sortBy?: string;

  @ValidateIf((o) => o.banStatus !== undefined)
  @IsIn(['all', 'banned', 'notBanned'])
  banStatus?: 'all' | 'banned' | 'notBanned';
}
