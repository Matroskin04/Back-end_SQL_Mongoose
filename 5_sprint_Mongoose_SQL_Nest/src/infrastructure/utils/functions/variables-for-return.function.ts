import {
  VariablesForReturnMongoType,
  VariablesForReturnType,
} from './types/variables-for-return.types';
import { QueryBlogInputModel } from '../../../features/blogs/blogger-blogs/api/models/input/query-blog.input.model';
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

export async function variablesForReturn(
  query: AllQueryParamsTypes,
): Promise<VariablesForReturnType> {
  const pageNumber = query?.pageNumber ?? 1;
  const pageSize = query?.pageSize ?? 10;
  const sortBy = query?.sortBy ?? 'id'; //'createdAt';
  const sortDirection = query?.sortDirection ?? 'desc';
  const searchLoginTerm: string | null = query?.searchLoginTerm ?? '';
  const searchEmailTerm: string | null = query?.searchEmailTerm ?? '';
  let banStatus: '%%' | boolean;
  if (!query?.banStatus || query?.banStatus === 'all') banStatus = '%%';
  else banStatus = query?.banStatus === 'banned';

  return {
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
    searchLoginTerm,
    searchEmailTerm,
    banStatus,
  };
}
