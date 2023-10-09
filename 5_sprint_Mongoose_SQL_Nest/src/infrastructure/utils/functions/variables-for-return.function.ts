import {
  VariablesForReturnMongoType,
  VariablesForReturnType,
} from './types/variables-for-return.types';
import { QueryBlogsInputModel } from '../../../features/blogs/api/models/input/queries-blog.input.model';
import { AllQueryParamsTypes } from './types/all-query-params.types';
import { PublishedStatusType } from '../../types/quiz-questions.general.types';

//todo separate function
export function variablesForReturn(
  query: AllQueryParamsTypes,
): VariablesForReturnType {
  const pageNumber = query?.pageNumber ?? 1;
  const pageSize = query?.pageSize ?? 10;
  const sortBy = query?.sortBy ?? 'createdAt';
  const sortDirection = (query?.sortDirection?.toUpperCase() ?? 'DESC') as
    | 'ASC'
    | 'DESC';

  let searchLoginTerm: string = query?.searchLoginTerm ?? '';
  let searchEmailTerm: string = query?.searchEmailTerm ?? '';
  const searchNameTerm: string = query?.searchNameTerm ?? '';

  //set value (if only 1 parameter was passed) - to fix OR in search
  if (searchLoginTerm === '' && searchEmailTerm !== '') {
    searchLoginTerm = 'upv298h92bD*f903-ud2hdn1~0r-~fuu0';
  }
  if (searchLoginTerm !== '' && searchEmailTerm === '') {
    searchEmailTerm = 'upv298h92bD*f903-ud2hdn1~0r-~fuu0';
  }

  let banStatus;
  if (!query?.banStatus || query?.banStatus === 'all') banStatus = null;
  else banStatus = query?.banStatus === 'banned';

  //quiz
  const bodySearchTerm: string = query?.bodySearchTerm ?? '';
  let publishedStatus;
  if (!query?.publishedStatus || query?.publishedStatus === 'all')
    publishedStatus = null;
  else publishedStatus = query?.publishedStatus === 'published';

  //statistic
  const sortQuery = query?.sort ?? ['avgScores desc', 'sumScore desc'];

  const sort: any = {}; //avgScores desc sumScore desc
  for (const i of sortQuery) {
    const [field, direction] = i.split(' ');
    sort[`"${field}"`] = direction.toUpperCase();
  }

  return {
    pageNumber,
    pageSize,
    sortBy,
    sort,
    sortDirection,
    searchLoginTerm,
    searchEmailTerm,
    searchNameTerm,
    banStatus,
    publishedStatus,
    bodySearchTerm,
  };
}
