import { Injectable } from '@nestjs/common';
import { QueryUsersSAInputModel } from '../../api/models/input/query-users-sa.input.model';
import {
  EmailAndLoginTerm,
  UsersPaginationType,
} from './users-sa.types.query.repository';
import {
  variablesForReturn,
  variablesForReturnMongo,
} from '../../../../../infrastructure/utils/functions/variables-for-return.function';
import { InjectModel } from '@nestjs/mongoose';
import { UserDBType, UserModelType } from '../../../domain/users.db.types';
import { ObjectId } from 'mongodb';
import { User } from '../../../domain/users.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { modifyUserIntoViewModel } from '../helpers/modify-user-into-view-model.helper';

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

  async getAllUsers(
    query: QueryUsersSAInputModel,
  ): Promise<UsersPaginationType> {
    //todo отдельное query
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchLoginTerm,
      searchEmailTerm,
      banStatus,
    } = await variablesForReturn(query);

    const result = await this.dataSource.query(
      `
    SELECT u."id", u."login", u."email", u."createdAt", bi."isBanned", bi."banDate", bi."banReason",
        (SELECT COUNT(*) 
          FROM public."users" as u2
            JOIN public."users_ban_info" as bi2
            ON bi2."userId" = u2."id"
          WHERE (u2."login" like $1 OR u2."email" like $2) AND (bi2."isBanned" = $3 OR $3 IS NULL))
    FROM public."users" as u
        JOIN public."users_ban_info" as bi
        ON bi."userId" = u."id"
    WHERE (u."login" like $1 OR u."email" like $2) AND (bi."isBanned" = $3 OR $3 IS NULL)
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT $4 OFFSET $5`,
      [
        '%' + searchLoginTerm + '%',
        '%' + searchEmailTerm + '%',
        banStatus,
        // sortBy,
        // sortDirection,
        +pageSize,
        (+pageNumber - 1) * +pageSize,
      ],
    );
    /*if (searchEmailTerm)
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
      .sort(paramsOfElems.paramSort);*/
    return {
      pagesCount: Math.ceil(+result[0]?.count ?? 0 / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +result[0]?.count ?? 0,
      items: result.map((p) => modifyUserIntoViewModel(p)),
    };
  }

  //MONGO
  async getUserByUserId(userId: ObjectId): Promise<UserDBType | null> {
    // todo отдельный логин

    const user = await this.UserModel.findOne({ _id: userId });
    return user;
  }
}
