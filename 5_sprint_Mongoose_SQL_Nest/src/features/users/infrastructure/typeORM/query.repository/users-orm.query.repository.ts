import { Injectable } from '@nestjs/common';
import { variablesForReturn } from '../../../../../infrastructure/utils/functions/variables-for-return.function';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, Repository } from 'typeorm';
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
import { UsersBanInfo } from '../../../domain/users-ban-info.entity';

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

    return userInfo ?? null;
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

    const result = await this.usersRepository
      .createQueryBuilder('u')
      .select([
        'u."id"',
        'u."login"',
        'u."email"',
        'u."createdAt"',
        'bi."isBanned"',
        'bi."banDate"',
        'bi."banReason"',
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)')
          .from(Users, 'u')
          .leftJoin('u.userBanInfo', 'bi')
          .where('u."isDeleted" = false')
          .andWhere(
            this.loginAndEmailConditionsBuilder(
              searchLoginTerm,
              searchEmailTerm,
            ),
          )
          .andWhere(this.BanConditionBuilder(banStatus));
      })
      .leftJoin('u.userBanInfo', 'bi')
      .where('u."isDeleted" = false')
      .andWhere(
        this.loginAndEmailConditionsBuilder(searchLoginTerm, searchEmailTerm),
      )
      .andWhere(this.BanConditionBuilder(banStatus))
      .orderBy(`u.${sortBy}`, sortDirection)
      .limit(+pageSize)
      .offset((+pageNumber - 1) * +pageSize)
      .getRawMany();

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
    const result = await this.usersRepository
      .createQueryBuilder('u')
      .select(['u.id as id', 'pc."expirationDate"', 'pc."confirmationCode"'])
      .leftJoin('u.userPasswordRecovery', 'pc')
      .where('pc.confirmationCode = :recoveryCode', { recoveryCode })
      .getRawOne();

    return result ?? null;
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
    const userInfo = await this.usersRepository
      .createQueryBuilder('u')
      .select([
        'u."id"',
        'u."login"',
        'u."email"',
        'u."createdAt"',
        'bi."isBanned"',
        'bi."banReason"',
        'bi."banDate"',
      ])
      .leftJoin('u.userBanInfo', 'bi')
      .where('u.id = :userId AND u."isDeleted" = false', { userId })
      .getRawOne();

    return userInfo ?? null;
  }

  async getUserPassEmailInfoByLoginOrEmail(
    logOrEmail: string,
  ): Promise<UserWithPassEmailInfoType | null> {
    const userInfo = await this.usersRepository
      .createQueryBuilder('u')
      .select([
        'u."id"',
        'u."login"',
        'u."email"',
        'u."passwordHash"',
        'ec."isConfirmed"',
      ])
      .leftJoin('u.userEmailConfirmation', 'ec')
      .where('u.login = :logOrEmail OR u.email = :logOrEmail', { logOrEmail })
      .getRawOne();

    return userInfo ?? null;
  }

  async doesUserExistByLoginOrEmail(logOrEmail: string): Promise<boolean> {
    const doesExist = await this.usersRepository
      .createQueryBuilder('u')
      .select()
      .leftJoin('u.userEmailConfirmation', 'ec')
      .where('u.login = :logOrEmail OR u.email = :logOrEmail', { logOrEmail })
      .getExists();

    return doesExist;
  }

  async getUserLoginById(userId: string): Promise<string | null> {
    const user = await this.usersRepository
      .createQueryBuilder('u')
      .select('u.login')
      .where('u.id = :userId', { userId })
      .andWhere('u.isDeleted = false')
      .getOne();

    return user?.login ?? null;
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

  private loginAndEmailConditionsBuilder(searchLoginTerm, searchEmailTerm) {
    return new Brackets((qb) => {
      qb.where('u."login" ILIKE :login OR u."email" ILIKE :email', {
        login: `%${searchLoginTerm}%`,
        email: `%${searchEmailTerm}%`,
      });
    });
  }

  private BanConditionBuilder(banStatus) {
    return new Brackets((qb) => {
      qb.where('bi."isBanned" = :banStatus OR :banStatus::boolean IS NULL', {
        banStatus,
      });
    });
  }
}
