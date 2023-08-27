import {
  VariablesForReturnMongoType,
  VariablesForReturnType,
} from './types/variables-for-return.types';
import { QueryBlogInputModel } from '../../../features/blogs/api/blogger/models/input/query-blog.input.model';
import { AllQueryParamsTypes } from './types/all-query-params-types';

export async function variablesForReturnMongo(
  query: AllQueryParamsTypes,
): Promise<VariablesForReturnMongoType> {
  const pageNumber = query?.pageNumber ?? 1;
  const pageSize = query?.pageSize ?? 10;
  const sortBy = query?.sortBy ?? '_id'; //'createdAt';
  const sortDirection = query?.sortDirection === 'asc' ? 1 : -1;
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
  const sortBy = query?.sortBy ?? 'id';
  const sortDirection = query?.sortDirection ?? 'desc';

  const searchLoginTerm: string = query?.searchLoginTerm ?? '';
  const searchEmailTerm: string = query?.searchEmailTerm ?? '';
  const searchNameTerm: string = query?.searchNameTerm ?? '';

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
