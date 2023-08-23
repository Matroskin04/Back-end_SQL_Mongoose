import { Injectable } from '@nestjs/common';
import { QueryUserInputModel } from '../../api/models/input/query-user.input.model';
import {
  EmailAndLoginTerm,
  UsersPaginationType,
} from './users-sa.types.query.repository';
import { variablesForReturn } from '../../../../../infrastructure/utils/functions/variables-for-return.function';
import { InjectModel } from '@nestjs/mongoose';
import { UserDBType, UserModelType } from '../../../domain/users.db.types';
import { ObjectId } from 'mongodb';
import { User } from '../../../domain/users.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersSAQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  //SQL

  async getUserWithBanInfoById(userId: string): Promise<any> {
    const userInfo = await this.dataSource.query(
      `
    SELECT u."id", u."login", u."email", u."createdAt", bi."isBanned", bi."banReason", bi."banDate"
      FROM public."users" AS u
        JOIN public."users_ban_info" AS bi
        ON u."id" = bi."userId"
      WHERE u."id" = $1`,
      [userId],
    );
    if (userInfo.length === 0) return null;
    return userInfo[0];
  }

  //MONGO
  async getAllUsers(query: QueryUserInputModel): Promise<UsersPaginationType> {
    //todo отдельное query
    const emailAndLoginTerm: EmailAndLoginTerm = [];
    let paramsOfSearch = {};
    const searchLoginTerm: string | null = query?.searchLoginTerm ?? null;
    const searchEmailTerm: string | null = query?.searchEmailTerm ?? null;
    const paramsOfElems = await variablesForReturn(query);

    if (searchEmailTerm)
      emailAndLoginTerm.push({
        email: { $regex: searchEmailTerm ?? '', $options: 'i' }, //todo исправить
      });
    if (searchLoginTerm)
      emailAndLoginTerm.push({
        login: { $regex: searchLoginTerm ?? '', $options: 'i' },
      });
    if (emailAndLoginTerm.length) paramsOfSearch = { $or: emailAndLoginTerm };
    if (query?.banStatus && query?.banStatus !== 'all')
      paramsOfSearch['banInfo.isBanned'] = query.banStatus === 'banned';

    const countAllUsersSort = await this.UserModel.countDocuments(
      paramsOfSearch,
    );

    const allUsersOnPages = await this.UserModel.find(paramsOfSearch)
      .skip((+paramsOfElems.pageNumber - 1) * +paramsOfElems.pageSize)
      .limit(+paramsOfElems.pageSize)
      .sort(paramsOfElems.paramSort);

    return {
      pagesCount: Math.ceil(countAllUsersSort / +paramsOfElems.pageSize),
      page: +paramsOfElems.pageNumber,
      pageSize: +paramsOfElems.pageSize,
      totalCount: countAllUsersSort,
      items: allUsersOnPages.map((p) => p.modifyIntoViewModel()),
    };
  }

  async getUserByUserId(userId: ObjectId): Promise<UserDBType | null> {
    // todo отдельный логин

    const user = await this.UserModel.findOne({ _id: userId });
    return user;
  }
}
