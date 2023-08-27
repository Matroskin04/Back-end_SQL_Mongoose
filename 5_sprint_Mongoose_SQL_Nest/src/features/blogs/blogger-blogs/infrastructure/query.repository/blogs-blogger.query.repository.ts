import {
  BlogPaginationType,
  BlogsIdType,
  BlogViewType,
} from './blogs-blogger.types.query.repository';
import { ObjectId } from 'mongodb';
import { QueryBlogInputModel } from '../../api/models/input/query-blog.input.model';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../../../domain/blogs.entity';
import { BlogModelType } from '../../../domain/blogs.db.types';
import {
  variablesForReturn,
  variablesForReturnMongo,
} from '../../../../../infrastructure/utils/functions/variables-for-return.function';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { modifyUserIntoViewModel } from '../../../../users/super-admin/infrastructure/helpers/modify-user-into-view-model.helper';
import {
  BlogOutputType,
  BlogSAOutputDBType,
} from '../../../super-admin-blogs/infrastructure/query.repository/blogs-sa.types.query.repository';

@Injectable()
export class BlogsBloggerQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  //SQL
  async getAllBlogsOfBlogger(
    query: QueryBlogInputModel,
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
      pagesCount: Math.ceil((+result[0]?.count || 0) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +result[0]?.count || 0,
      items: result.map((e) => {
        delete e.count;
        return e;
      }),
    };
  }

  async getBlogById(blogId: string): Promise<BlogOutputType | null> {
    const result = await this.dataSource.query(
      `
    SELECT "id", "userId", "name", "description", "websiteUrl", "isBanned"
      FROM public."blogs"
        WHERE "id" = $1`,
      [blogId],
    );
    if (!result[0]) return null;
    return result[0];
  }

  //MONGO
  async getBlogByIdMongo(id: ObjectId): Promise<null | BlogViewType> {
    const blog = await this.BlogModel.findOne(
      { _id: id },
      { blogOwnerInfo: 0 },
    );

    if (blog) {
      return blog.modifyIntoViewGeneralModel();
    }
    return null;
  }

  async getAllBlogsIdOfBlogger(userId: string): Promise<BlogsIdType> {
    const allBlogsId = await this.BlogModel.find(
      {
        'blogOwnerInfo.userId': userId,
      },
      { _id: 1 },
    ).lean();
    return allBlogsId;
  }
}
