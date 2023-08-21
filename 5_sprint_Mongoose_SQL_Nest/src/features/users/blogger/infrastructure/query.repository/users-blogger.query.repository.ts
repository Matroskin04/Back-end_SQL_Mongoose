import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BannedUsersByBlogger } from '../../../banned/banned-by-blogger-users/domain/users-banned-by-blogger.entity';
import { BannedUsersByBloggerModelType } from '../../../banned/banned-by-blogger-users/domain/users-banned-by-blogger.db.types';
import { BannedUsersOfBlogPaginationType } from './users-blogger.types.query.repository';
import { ObjectId } from 'mongodb';
import { variablesForReturn } from '../../../../../infrastructure/utils/functions/variables-for-return.function';
import { QueryUserInputModel } from '../../../super-admin/api/models/input/query-user.input.model';
import { User } from '../../../domain/users.entity';
import { UserModelType } from '../../../domain/users.db.types';

Injectable();
export class UsersBloggerQueryRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    @InjectModel(BannedUsersByBlogger.name)
    private BannedUsersByBloggerModel: BannedUsersByBloggerModelType,
  ) {}

  async getBannedUsersOfBlog(
    query: QueryUserInputModel,
    blogId: string,
  ): Promise<BannedUsersOfBlogPaginationType> {
    const searchLoginTerm: string | null = query?.searchLoginTerm ?? null;
    const paramsOfElems = await variablesForReturn(query);
    const paramsOfSearchLogin = {
      $regex: searchLoginTerm ?? '',
      $options: 'i',
    };

    const countAllBannedUsersSort =
      await this.BannedUsersByBloggerModel.countDocuments({
        blogId,
        login: paramsOfSearchLogin, //todo проверка
      });

    const allBannedUsersOnPages = await this.BannedUsersByBloggerModel.find({
      blogId,
      login: paramsOfSearchLogin,
    })
      .skip((+paramsOfElems.pageNumber - 1) * +paramsOfElems.pageSize)
      .limit(+paramsOfElems.pageSize)
      .sort(paramsOfElems.paramSort);

    return {
      pagesCount: Math.ceil(countAllBannedUsersSort / +paramsOfElems.pageSize),
      page: +paramsOfElems.pageNumber,
      pageSize: +paramsOfElems.pageSize,
      totalCount: countAllBannedUsersSort,
      items: allBannedUsersOnPages.map((p) => p.modifyIntoViewModel()),
    };
  }

  async getUserLoginById(userId: ObjectId): Promise<string | undefined> {
    const userLogin = await this.UserModel.findOne(
      { _id: userId },
      {
        login: 1,
        _id: 0,
      },
    ).lean();
    return userLogin?.login;
  }
}
