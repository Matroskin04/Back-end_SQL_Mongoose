import {
  BannedBlogsIdType,
  BlogPaginationType,
  BlogOutputType,
} from './blogs-public.types.query.repository';
import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../../../domain/blogs.entity';
import { BlogModelType } from '../../../domain/blogs.db.types';
import { QueryBlogInputModel } from '../../../blogger-blogs/api/models/input/query-blog.input.model';
import {
  variablesForReturn,
  variablesForReturnMongo,
} from '../../../../../infrastructure/utils/functions/variables-for-return.function';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsPublicQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  async getAllBlogs(query: QueryBlogInputModel): Promise<BlogPaginationType> {
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
      pagesCount: Math.ceil((+result[0]?.count || 0) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +result[0]?.count || 0,
      items: result,
    };
  }

  async getBlogById(blogId: string): Promise<null | BlogOutputType> {
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

  //MONGO
  async getAllBannedBlogsId(): Promise<null | BannedBlogsIdType> {
    const result = await this.BlogModel.find(
      {
        isBanned: true,
      },
      { _id: 1 },
    ).lean();
    return result;
  }
}
