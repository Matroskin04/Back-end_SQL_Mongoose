import {
  BannedBlogsIdType,
  BlogPaginationType,
  BlogViewType,
} from './blogs-public.types.query.repository';
import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog } from '../../../domain/blogs.entity';
import { BlogModelType } from '../../../domain/blogs.db.types';
import { QueryBlogInputModel } from '../../../blogger-blogs/api/models/input/query-blog.input.model';
import { variablesForReturn } from '../../../../../infrastructure/utils/functions/variables-for-return.function';

@Injectable()
export class BlogsPublicQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}
  async getAllBlogs(query: QueryBlogInputModel): Promise<BlogPaginationType> {
    const searchNameTerm: string | null = query?.searchNameTerm ?? null;
    const paramsOfElems = await variablesForReturn(query);

    const countAllBlogsSort = await this.BlogModel.countDocuments({
      name: { $regex: searchNameTerm ?? '', $options: 'i' },
      isBanned: false,
    });

    const allBlogsOnPages = await this.BlogModel.find({
      name: { $regex: searchNameTerm ?? '', $options: 'i' },
      isBanned: false,
    })
      .skip((+paramsOfElems.pageNumber - 1) * +paramsOfElems.pageSize)
      .limit(+paramsOfElems.pageSize)
      .sort(paramsOfElems.paramSort);

    return {
      pagesCount: Math.ceil(countAllBlogsSort / +paramsOfElems.pageSize),
      page: +paramsOfElems.pageNumber,
      pageSize: +paramsOfElems.pageSize,
      totalCount: countAllBlogsSort,
      items: allBlogsOnPages.map((p) => p.modifyIntoViewGeneralModel()),
    };
  }

  async getBlogById(id: string): Promise<null | BlogViewType> {
    const blog = await this.BlogModel.findOne({
      _id: new ObjectId(id),
      isBanned: false,
    });

    if (blog) {
      return blog.modifyIntoViewGeneralModel();
    }
    return null;
  }

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
