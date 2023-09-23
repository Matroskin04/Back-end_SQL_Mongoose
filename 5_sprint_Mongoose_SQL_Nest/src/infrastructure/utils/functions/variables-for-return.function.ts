import {
  VariablesForReturnMongoType,
  VariablesForReturnType,
} from './types/variables-for-return.types';
import { QueryBlogsInputModel } from '../../../features/blogs/api/models/input/queries-blog.input.model';
import { AllQueryParamsTypes } from './types/all-query-params.types';

export async function variablesForReturnMongo(
  query: AllQueryParamsTypes,
): Promise<VariablesForReturnMongoType> {
  const pageNumber = query?.pageNumber ?? 1;
  const pageSize = query?.pageSize ?? 10;
  const sortBy = query?.sortBy ?? '_id'; //'createdAt';
  const sortDirection = query?.sortDirection?.toUpperCase() === 'ASC' ? 1 : -1;
  const paramSort = { [sortBy]: sortDirection };

  return {
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    paramSort,
  };
}

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

  return {
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    searchLoginTerm,
    searchEmailTerm,
    searchNameTerm,
    banStatus,
  };
}
