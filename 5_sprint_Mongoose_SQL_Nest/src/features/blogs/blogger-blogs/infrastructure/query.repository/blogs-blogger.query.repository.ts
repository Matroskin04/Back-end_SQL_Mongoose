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
import { variablesForReturn } from '../../../../../infrastructure/utils/functions/variables-for-return.function';

@Injectable()
export class BlogsBloggerQueryRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}
  async getAllBlogs(
    query: QueryBlogInputModel,
    userId: string,
  ): Promise<BlogPaginationType> {
    const searchNameTerm: string | null = query?.searchNameTerm ?? null;
    const paramsOfElems = await variablesForReturn(query);

    const countAllBlogsSort = await this.BlogModel.countDocuments({
      name: { $regex: searchNameTerm ?? '', $options: 'i' },
      'blogOwnerInfo.userId': userId,
    });

    const allBlogsOnPages = await this.BlogModel.find(
      {
        name: { $regex: searchNameTerm ?? '', $options: 'i' },
        'blogOwnerInfo.userId': userId,
      },
      { blogOwnerInfo: 0 },
    )
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

  async getBlogById(id: ObjectId): Promise<null | BlogViewType> {
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
