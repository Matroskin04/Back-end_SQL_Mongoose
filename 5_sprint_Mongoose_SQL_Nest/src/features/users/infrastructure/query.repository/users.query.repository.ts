import { Injectable } from '@nestjs/common';
import { QueryUsersSAInputModel } from '../../api/sa/models/input/query-users-sa.input.model';
import { variablesForReturn } from '../../../../infrastructure/utils/functions/variables-for-return.function';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  modifyBannedUserOfBlogIntoViewModel,
  modifyUserIntoViewModel,
} from '../helpers/modify-user-into-view-model.helper';
import { QueryUsersBloggerInputModel } from '../../api/blogger/models/input/query-users-blogger.input.model';
import {
  BannedUsersOfBlogPaginationType,
  UsersInfoPublicType,
  UsersPaginationType,
} from './users.types.query.repository';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  //view methods
  async getUserInfoById(userId: string): Promise<null | UsersInfoPublicType> {
    const result = await this.dataSource.query(
      `
    SELECT "email", "login", "id" AS "userId"
        FROM public."users"
        WHERE "id" = $1
    `,
      [userId],
    );
    return result[0];
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
    } = variablesForReturn(query);
    //todo validate input data
    const result = await this.dataSource.query(
      `
    SELECT u."id", u."login", u."email", u."createdAt", bi."isBanned", bi."banDate", bi."banReason",
        (SELECT COUNT(*) 
          FROM public."users" as u2
            JOIN public."users_ban_info" as bi2
            ON bi2."userId" = u2."id"
          WHERE (u2."login" ILIKE $1 OR u2."email" ILIKE $2) AND (bi2."isBanned" = $3 OR $3 IS NULL))
    FROM public."users" as u
        JOIN public."users_ban_info" as bi
        ON bi."userId" = u."id"
    WHERE (u."login" ILIKE $1 OR u."email" ILIKE $2) AND (bi."isBanned" = $3 OR $3 IS NULL) AND (u."isDeleted" = false)
        ORDER BY "${sortBy}" ${sortDirection}
        LIMIT $4 OFFSET $5`,
      [
        '%' + searchLoginTerm + '%',
        '%' + searchEmailTerm + '%',
        banStatus,
        +pageSize,
        (+pageNumber - 1) * +pageSize,
      ],
    );

    return {
      pagesCount: Math.ceil((+result[0]?.count || 0) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +result[0]?.count || 0,
      items: result.map((p) => modifyUserIntoViewModel(p)),
    };
  }

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

  //addition methods
  async getUserByRecoveryCode(recoveryCode: string): Promise<any> {
    //todo тип
    const result = await this.dataSource.query(
      `
    SELECT u."id", pc."expirationDate", pc."confirmationCode"
      FROM public."users" AS u
      JOIN public."users_password_recovery" AS pc
        ON u."id" = pc."userId"
        WHERE "confirmationCode" = $1`,
      [recoveryCode],
    );
    if (!result[0]) return null;
    return result[0];
  }

  async getUserBanInfoByLoginOrEmail(logOrEmail: string): Promise<any | null> {
    //todo тип
    const userInfo = await this.dataSource.query(
      `
    SELECT u."id", u."login", u."email", bi."isBanned" 
      FROM public."users" as u
        JOIN public."users_ban_info" as bi
        ON u."id" = bi."userId"
      WHERE u."login" = $1 OR u."email" = $1`,
      [logOrEmail],
    );
    if (userInfo.length === 0) return null;
    return userInfo[0];
  }

  async getUserWithBanInfoById(userId: string): Promise<any> {
    const userInfo = await this.dataSource.query(
      `
    SELECT u."id", u."login", u."email", u."createdAt", bi."isBanned", bi."banReason", bi."banDate"
      FROM public."users" as u
        JOIN public."users_ban_info" as bi
        ON u."id" = bi."userId"
      WHERE u."id" = $1 AND u."isDeleted" = false`,
      [userId],
    );
    if (userInfo.length === 0) return null;
    return userInfo[0];
  }

  async getUserPassEmailInfoByLoginOrEmail(
    logOrEmail: string,
  ): Promise<any | null> {
    //todo тип
    const userInfo = await this.dataSource.query(
      `
    SELECT u."id", u."login", u."email", u."passwordHash", ec."isConfirmed" 
      FROM public."users" AS u
      JOIN public."users_email_confirmation" AS ec 
      ON u."id" = ec."userId"
      WHERE u."login" = $1 OR u."email" = $1`,
      [logOrEmail],
    );
    if (userInfo.length === 0) return null;
    return userInfo[0];
  }

  async getUserLoginById(userId: string): Promise<string | null> {
    const result = await this.dataSource.query(
      `
    SELECT "login"
      FROM public."users"
        WHERE "id" = $1 AND "isDeleted" = false`,
      [userId],
    );
    if (!result[0]) return null;
    return result[0].login;
  }

  async getUserIdByConfirmationCode(confirmationCode: string): Promise<string> {
    const result = await this.dataSource.query(
      `
    SELECT "userId" FROM public."users_email_confirmation"
        WHERE "confirmationCode" = $1`,
      [confirmationCode],
    );
    return result[0].userId;
  }
}
