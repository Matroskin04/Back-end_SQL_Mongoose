import { Injectable } from '@nestjs/common';
import { variablesForReturn } from '../../../../../infrastructure/utils/functions/variables-for-return.function';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  BannedUsersOfBlogPaginationType,
  UserBanInfoType,
  UserByRecoveryCodeType,
  UsersInfoViewType,
  UsersPaginationType,
  UserWithBanInfoType,
  UserWithPassEmailInfoType,
} from '../../SQL/query.repository/users.output.types.query.repository';
import {
  UsersQueryBloggerType,
  UsersQuerySAType,
} from '../../SQL/query.repository/users.input.types.query.repository';
import {
  modifyBannedUserOfBlogIntoViewModel,
  modifyUserIntoViewModel,
} from '../../SQL/helpers/modify-user-into-view-model.helper';
import { Users } from '../../../domain/users.entity';
import { UsersEmailConfirmation } from '../../../domain/users-email-confirmation.entity';

@Injectable()
export class UsersOrmQueryRepository {
  constructor(
    @InjectRepository(Users)
    protected usersRepository: Repository<Users>,
    @InjectRepository(UsersEmailConfirmation)
    protected usersEmailConfirmation: Repository<UsersEmailConfirmation>,
    @InjectDataSource()
    protected dataSource: DataSource,
  ) {}

  //view methods
  async getUserInfoByIdView(userId: string): Promise<null | UsersInfoViewType> {
    const userInfo = await this.usersRepository
      .createQueryBuilder('u')
      .select(['u.email AS email', 'u.login AS login', 'u.id AS "userId"'])
      .where('u.id = :userId', { userId })
      .getRawOne();

    return userInfo;
  }

  async getAllUsersView(query: UsersQuerySAType): Promise<UsersPaginationType> {
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchLoginTerm,
      searchEmailTerm,
      banStatus,
    } = variablesForReturn(query);

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
      pagesCount: Math.ceil((+result[0]?.count || 1) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +result[0]?.count || 0,
      items: result.map((p) => modifyUserIntoViewModel(p)),
    };
  }

  async getBannedUsersOfBlogView(
    query: UsersQueryBloggerType,
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
      pagesCount: Math.ceil((+result[0]?.count || 1) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +result[0]?.count || 0,
      items: result.map((p) => modifyBannedUserOfBlogIntoViewModel(p)),
    };
  }

  //addition methods
  async doesUserExistById(userId: string): Promise<boolean> {
    const doesExist = await this.usersRepository
      .createQueryBuilder('u')
      .select('COUNT(*) as count')
      .where('u.id = :userId', { userId })
      .getRawOne();

    return +doesExist.count === 1;
  }

  async doesUserExistByLoginEmail(loginOrEmail: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    SELECT COUNT(*)
        FROM public."users"
        WHERE "login" = $1 OR "email" = $1
    `,
      [loginOrEmail],
    );
    return +result[0].count === 1;
  }

  async getUserByRecoveryCode(
    recoveryCode: string,
  ): Promise<UserByRecoveryCodeType | null> {
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

  async getUserBanInfoByLoginOrEmail(
    logOrEmail: string,
  ): Promise<UserBanInfoType | null> {
    const userInfo = await this.usersRepository
      .createQueryBuilder('u')
      .select(['u."id"', 'u."login"', 'u."email"', 'bi."isBanned"'])
      .leftJoin('u.userBanInfo', 'bi')
      .where('u.login = :logOrEmail OR u.email = :logOrEmail', { logOrEmail })
      .getRawOne();

    return userInfo ?? null;
  }

  async getUserWithBanInfoById(
    userId: string,
  ): Promise<UserWithBanInfoType | null> {
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
  ): Promise<UserWithPassEmailInfoType | null> {
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

  async getUserIdByConfirmationCode(
    confirmationCode: string,
  ): Promise<string | null> {
    const result = await this.usersEmailConfirmation
      .createQueryBuilder('ec')
      .select('ec.userId')
      .where('ec.confirmationCode = :confirmationCode', { confirmationCode })
      .getOne();

    return result?.userId || null;
  }
}
