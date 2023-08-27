import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BannedUsersByBlogger } from '../../../banned/banned-by-blogger-users/domain/users-banned-by-blogger.entity';
import { BannedUsersByBloggerModelType } from '../../../banned/banned-by-blogger-users/domain/users-banned-by-blogger.db.types';
import { BannedUsersOfBlogPaginationType } from './users-blogger.types.query.repository';
import { ObjectId } from 'mongodb';
import {
  variablesForReturn,
  variablesForReturnMongo,
} from '../../../../../infrastructure/utils/functions/variables-for-return.function';
import { User } from '../../../domain/users.entity';
import { UserModelType } from '../../../domain/users.db.types';
import { QueryUsersBloggerInputModel } from '../../api/models/input/query-users-blogger.input.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  modifyBannedUserOfBlogIntoViewModel,
  modifyUserIntoViewModel,
} from '../../../super-admin/infrastructure/helpers/modify-user-into-view-model.helper';

Injectable();
export class UsersBloggerQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(User.name)
    private UserModel: UserModelType,
    @InjectModel(BannedUsersByBlogger.name)
    private BannedUsersByBloggerModel: BannedUsersByBloggerModelType,
  ) {}

  async getBannedUsersOfBlog(
    query: QueryUsersBloggerInputModel,
    blogId: string,
  ): Promise<BannedUsersOfBlogPaginationType> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchLoginTerm } =
      variablesForReturn(query);
    //todo validate input data, bi2 - нужна 2?
    const result = await this.dataSource.query(
      `
    SELECT u."id", u."login", bi."isBanned", bi."banReason", bi."banDate",
        (SELECT COUNT(*)
            FROM public."banned_users_of_blog" as bi2
                JOIN public."users" as u2
                ON u2."id" = bi2."userId"
        WHERE u2."login" ILIKE $1 AND bi2."blogId" = $2 AND u."isDeleted" = false)
    FROM public."banned_users_of_blog" as bi
        JOIN public."users" as u
        ON u."id" = bi."userId"
    WHERE u."login" ILIKE $1 AND bi."blogId" = $2 AND u."isDeleted" = false
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT $3 OFFSET $4;`,
      [
        `%${searchLoginTerm}%`,
        blogId,
        +pageSize,
        (+pageNumber - 1) * +pageSize,
      ],
    );

    return {
      pagesCount: Math.ceil((+result[0]?.count || 0) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +result[0]?.count || 0,
      items: result.map((p) => modifyBannedUserOfBlogIntoViewModel(p)),
    };
  }
}
