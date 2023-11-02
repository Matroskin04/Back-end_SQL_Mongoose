import {
  IsIn,
  IsNumber,
  IsPositive,
  Matches,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
const valuesOfSortingBlogs = [
  'id',
  'name',
  'description',
  'websiteUrl',
  'createdAt',
  'isMembership',
];
const valuesOfSortingPosts = [
  'id',
  'title',
  'shortDescription',
  'content',
  'blogId',
  'blogName',
  'createdAt',
  'likesCount',
  'dislikesCount',
  'myStatus',
];
const valuesOfSortingComments = [
  'id',
  'content',
  'createdAt',
  'userId',
  'userLogin',
  'title',
  'blogId',
  'blogName',
];

export class QueryGeneralParams {
  //todo куда вынести
  @ValidateIf((o) => o.sortDirection !== undefined)
  @Matches(/^(desc|asc)$/i, {
    message: 'sortDirection must be one of the following values: desc, asc',
  })
  @Transform(({ value }) => value.toLowerCase())
  @IsIn(['asc', 'desc'])
  sortDirection?: 'ASC' | 'DESC';

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
export class QueryBlogsInputModel extends QueryGeneralParams {
  searchNameTerm?: string;

  @ValidateIf((o) => o.sortBy !== undefined)
  @IsIn(valuesOfSortingBlogs)
  sortBy?: string;
}

export class QueryPostsOfBlogInputModel extends QueryGeneralParams {
  @ValidateIf((o) => o.sortBy !== undefined)
  @IsIn(valuesOfSortingPosts)
  sortBy?: string;
}

export class QueryCommentsOfBlogInputModel extends QueryGeneralParams {
  @ValidateIf((o) => o.sortBy !== undefined)
  @IsIn(valuesOfSortingComments)
  sortBy?: string;
}
