import { Contains, Matches } from 'class-validator';

export class QueryBlogsInputModel {
  searchNameTerm?: string;

  @Contains('hello')
  sortBy?: string;

  @Matches(/^(desc|asc)$/i, {
    message: 'The value of sortDirection should be desc or asc',
  })
  sortDirection?: string;

  pageNumber?: string;

  pageSize?: string;
}

export class QueryPostsOfBlogInputModel {
  @Contains('hello')
  sortBy?: string;

  @Matches(/^(desc|asc)$/i, {
    message: 'The value of sortDirection should be desc or asc',
  })
  sortDirection?: string;

  pageNumber?: string;

  pageSize?: string;
}

export class QueryCommentsOfBlogInputModel extends QueryPostsOfBlogInputModel {}
