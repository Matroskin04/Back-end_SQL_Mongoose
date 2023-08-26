import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../../../domain/blogs.entity';
import { BlogModelType } from '../../../domain/blogs.db.types';
import {
  variablesForReturn,
  variablesForReturnMongo,
} from '../../../../../infrastructure/utils/functions/variables-for-return.function';
import { QueryBlogInputModel } from '../../../blogger-blogs/api/models/input/query-blog.input.model';
import {
  BlogSAOutputDBType,
  ViewAllBlogsModel,
} from './blogs-sa.types.query.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsSAQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}
  //SQL
  // async getAllBlogs(query: QueryBlogInputModel): Promise<ViewAllBlogsModel> {
  //   const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
  //     variablesForReturn(query);
  //
  //   const result = await this.dataSource.query(
  //     `
  //   SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership",
  //     (SELECT COUNT(*)
  //       FROM public."blogs"
  //       WHERE "name" ILIKE $1 AND "userId" = $2)
  //   FROM public."blogs"
  //       WHERE "name" ILIKE $1 AND "userId" = $2
  //           ORDER BY "${sortBy}" ${sortDirection}
  //           LIMIT $3 OFFSET $4`,
  //     [`%${searchNameTerm}%`, userId, +pageSize, (+pageNumber - 1) * +pageSize],
  //   );
  //
  //   return {
  //     pagesCount: Math.ceil((+result[0]?.count || 0) / +pageSize),
  //     page: +pageNumber,
  //     pageSize: +pageSize,
  //     totalCount: +result[0]?.count || 0,
  //     items: allBlogsOnPages.map((p) => p.modifyIntoViewSAModel()),
  //   };
  // }

  //MONGO
  async getAllBlogsMongo(
    query: QueryBlogInputModel,
  ): Promise<ViewAllBlogsModel> {
    const searchNameTerm: string | null = query?.searchNameTerm ?? null;
    const paramsOfElems = await variablesForReturnMongo(query);

    const countAllBlogsSort = await this.BlogModel.countDocuments({
      name: { $regex: searchNameTerm ?? '', $options: 'i' },
    });

    const allBlogsOnPages = await this.BlogModel.find({
      name: { $regex: searchNameTerm ?? '', $options: 'i' },
    })
      .skip((+paramsOfElems.pageNumber - 1) * +paramsOfElems.pageSize)
      .limit(+paramsOfElems.pageSize)
      .sort(paramsOfElems.paramSort);

    return {
      pagesCount: Math.ceil(countAllBlogsSort / +paramsOfElems.pageSize),
      page: +paramsOfElems.pageNumber,
      pageSize: +paramsOfElems.pageSize,
      totalCount: countAllBlogsSort,
      items: allBlogsOnPages.map((p) => p.modifyIntoViewSAModel()),
    };
  }

  async getBlogById(blogId: ObjectId): Promise<BlogSAOutputDBType | null> {
    const blog = this.BlogModel.findOne({ _id: blogId }).lean();
    return blog;
  }
}
