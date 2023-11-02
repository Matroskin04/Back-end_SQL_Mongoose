import {
  BlogPaginationType,
  BlogOutputType,
  BlogAllInfoOutputType,
} from './blogs-public.types.query.repository';
import { Injectable } from '@nestjs/common';
import { QueryBlogsInputModel } from '../../../api/models/input/queries-blog.input.model';
import { variablesForReturn } from '../../../../../infrastructure/utils/functions/variables-for-return.function';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AllBlogsSAViewType } from './blogs-sa.types.query.repository';
import { modifyBlogIntoSaOutputModel } from '../../../helpers/modify-blog-into-sa-output-model';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async getAllBlogsOfBlogger(
    query: QueryBlogsInputModel,
    userId: string,
  ): Promise<BlogPaginationType> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
      variablesForReturn(query);

    const result = await this.dataSource.query(
      `
    SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership",
      (SELECT COUNT(*)
        FROM public."blogs"
        WHERE "name" ILIKE $1 AND "userId" = $2)
    FROM public."blogs"
        WHERE "name" ILIKE $1 AND "userId" = $2
            ORDER BY "${sortBy}" ${sortDirection}
            LIMIT $3 OFFSET $4`,
      [`%${searchNameTerm}%`, userId, +pageSize, (+pageNumber - 1) * +pageSize],
    );

    return {
      pagesCount: Math.ceil((+result[0]?.count || 1) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +result[0]?.count || 0,
      items: result.map((e) => {
        delete e.count;
        return e;
      }),
    };
  }

  async getAllBlogsSA(
    query: QueryBlogsInputModel,
  ): Promise<AllBlogsSAViewType> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
      variablesForReturn(query);

    const result = await this.dataSource.query(
      `
    SELECT b."id", b."name", b."description", b."websiteUrl", b."createdAt", b."isMembership",
           b."userId", b."isBanned", b."banDate", u."login" as "userLogin",
      (SELECT COUNT(*)
        FROM public."blogs"
        WHERE "name" ILIKE $1)
    FROM public."blogs" as b
        JOIN public."users" as u
        ON u."id" = b."userId"
    WHERE "name" ILIKE $1
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT $2 OFFSET $3`,
      [`%${searchNameTerm}%`, +pageSize, (+pageNumber - 1) * +pageSize],
    );

    return {
      pagesCount: Math.ceil((+result[0]?.count || 1) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +result[0]?.count,
      items: result.map((blog) => modifyBlogIntoSaOutputModel(blog)),
    };
  }

  async getAllBlogsPublic(
    query: QueryBlogsInputModel,
  ): Promise<BlogPaginationType> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
      variablesForReturn(query);
    //isBanned
    const result = await this.dataSource.query(
      `
    SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership",
      (SELECT COUNT(*)
        FROM public."blogs"
        WHERE "name" ILIKE $1 AND "isBanned" = false)
    FROM public."blogs"
        WHERE "name" ILIKE $1 AND "isBanned" = false
            ORDER BY "${sortBy}" ${sortDirection}
            LIMIT $2 OFFSET $3`,
      [`%${searchNameTerm}%`, +pageSize, (+pageNumber - 1) * +pageSize],
    );

    return {
      pagesCount: Math.ceil((+result[0]?.count || 1) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +result[0]?.count || 0,
      items: result.map((e) => {
        delete e.count;
        return e;
      }),
    };
  }

  async getBlogByIdPublic(blogId: string): Promise<null | BlogOutputType> {
    const result = await this.dataSource.query(
      `
    SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership"
      FROM public."blogs"
        WHERE "id" = $1 AND "isBanned" = false`,
      [blogId],
    );
    if (!result[0]) return null;
    return result[0];
  }

  async getBlogAllInfoById(
    blogId: string,
  ): Promise<null | BlogAllInfoOutputType> {
    const result = await this.dataSource.query(
      `
    SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership", "isBanned", "userId"
      FROM public."blogs"
        WHERE "id" = $1`,
      [blogId],
    );
    if (!result[0]) return null;
    return result[0];
  }

  async isUserBannedForBlog(userId: string, blogId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    SELECT "isBanned" 
        FROM public."banned_users_of_blog"
            WHERE "userId" = $1 AND "blogId" = $2`,
      [userId, blogId],
    );
    return !!result[0]?.isBanned;
  }

  async doesBlogExist(blogId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
  SELECT COUNT(*)
    FROM public."blogs"
        WHERE "id" = $1`,
      [blogId],
    );
    return +result[0].count === 1;
  }
}
