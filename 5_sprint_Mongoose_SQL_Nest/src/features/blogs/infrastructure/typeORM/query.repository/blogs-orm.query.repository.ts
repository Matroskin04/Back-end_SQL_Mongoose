import {
  BlogPaginationType,
  BlogOutputType,
  BlogAllInfoOutputType,
} from './blogs-public.types.query.repository';
import { Injectable } from '@nestjs/common';
import { QueryBlogsInputModel } from '../../../api/models/input/queries-blog.input.model';
import { variablesForReturn } from '../../../../../infrastructure/utils/functions/variables-for-return.function';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AllBlogsSAViewType } from './blogs-sa.types.query.repository';
import { Blogs } from '../../../domain/blogs.entity';
import { BannedUsersOfBlog } from '../../../domain/banned-users-of-blog.entity';
import { modifyBlogIntoViewSAModel } from '../../../../../infrastructure/utils/functions/features/blog.functions.helpers';
import { QuizInfoAboutUser } from '../../../../quiz/domain/quiz-game-info-about-user.entity';
import { Quiz } from '../../../../quiz/domain/quiz.entity';
import { QuizStatusEnum } from '../../../../../infrastructure/utils/enums/quiz.enums';

@Injectable()
export class BlogsOrmQueryRepository {
  constructor(
    @InjectRepository(Blogs)
    protected blogsRepository: Repository<Blogs>,
    @InjectRepository(BannedUsersOfBlog)
    protected bannedUsersOfBlogRepository: Repository<BannedUsersOfBlog>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async getAllBlogsOfBlogger(
    query: QueryBlogsInputModel,
    userId: string,
  ): Promise<BlogPaginationType> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
      variablesForReturn(query);

    const result = await this.dataSource.query(
      `
    SELECT "id", "name", "description", "websiteUrl", "createdAt", "isMembership",
      (SELECT COUNT(*)
        FROM public."blogs"
        WHERE "name" ILIKE $1 AND "userId" = $2)
    FROM public."blogs"
        WHERE "name" ILIKE $1 AND "userId" = $2
            ORDER BY "${sortBy}" ${sortDirection}
            LIMIT $3 OFFSET $4`,
      [`%${searchNameTerm}%`, userId, +pageSize, (+pageNumber - 1) * +pageSize],
    );

    return {
      pagesCount: Math.ceil((+result[0]?.count || 1) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +result[0]?.count || 0,
      items: result.map((e) => {
        delete e.count;
        return e;
      }),
    };
  }

  async getAllBlogsSA(
    queryParams: QueryBlogsInputModel,
  ): Promise<AllBlogsSAViewType> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
      variablesForReturn(queryParams);

    const query = await this.blogsRepository
      .createQueryBuilder('b')
      .select([
        'b."id"',
        'b."name"',
        'b."description"',
        'b."websiteUrl"',
        'b."createdAt"',
        'b."isMembership"',
        'b."userId"',
        'u.login as "userLogin"',
        'b."isBanned"',
        'b."banDate"',
      ])
      .addSelect((qb) => {
        return qb
          .select('COUNT(*)')
          .from(Blogs, 'b')
          .where('b.name ILIKE :name', { name: `%${searchNameTerm}%` })
          .andWhere('b.isBanned = false');
      }, 'count')
      .leftJoin('b.user', 'u')
      .where('b.name ILIKE :name', { name: `%${searchNameTerm}%` })
      .andWhere('b.isBanned = false')
      .orderBy(`b.${sortBy}`, sortDirection)
      .limit(+pageSize)
      .offset((+pageNumber - 1) * +pageSize);

    const result = await query.getRawMany();

    return {
      pagesCount: Math.ceil((+result[0]?.count || 1) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +result[0]?.count || 0,
      items: result.map((blog) => modifyBlogIntoViewSAModel(blog)),
    };
  }

  async getAllBlogsPublic(
    query: QueryBlogsInputModel,
  ): Promise<BlogPaginationType> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
      variablesForReturn(query);

    const result = await this.blogsRepository
      .createQueryBuilder('b')
      .select([
        'b.id',
        'b.name',
        'b.description',
        'b.websiteUrl',
        'b.createdAt',
        'b.isMembership',
      ])
      .where('b.name ILIKE :name', { name: `%${searchNameTerm}%` })
      .andWhere('b.isBanned = false')
      .orderBy(`b.${sortBy}`, sortDirection)
      .limit(+pageSize)
      .offset((+pageNumber - 1) * +pageSize)
      .getManyAndCount();

    return {
      pagesCount: Math.ceil((result[1] || 1) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: result[1] || 0,
      items: result[0].map((blog) => ({
        ...blog,
        createdAt: blog.createdAt.toISOString(),
      })),
    };
  }

  async getBlogByIdPublic(blogId: string): Promise<null | BlogOutputType> {
    const result = await this.blogsRepository
      .createQueryBuilder('b')
      .select([
        'b.id',
        'b.name',
        'b.description',
        'b.websiteUrl',
        'b.createdAt',
        'b.isMembership',
      ])
      .where('b.id = :blogId', { blogId })
      .andWhere('b.isBanned = false')
      .getOne();

    return result
      ? { ...result, createdAt: result.createdAt.toISOString() }
      : null;
  }

  async getBlogAllInfoById(
    blogId: string,
  ): Promise<null | BlogAllInfoOutputType> {
    const result = await this.blogsRepository
      .createQueryBuilder('b')
      .select([
        'b.id',
        'b.name',
        'b.description',
        'b.websiteUrl',
        'b.createdAt',
        'b.isMembership',
        'b.isBanned',
        'b.userId',
      ])
      .where('b.id = :blogId', { blogId })
      .getOne();

    return result
      ? { ...result, createdAt: result.createdAt.toISOString() }
      : null;
  }

  async isUserBannedForBlog(userId: string, blogId: string): Promise<boolean> {
    const result = await this.bannedUsersOfBlogRepository
      .createQueryBuilder('bu')
      .select('bu."isBanned"')
      .where('bu."userId" = :userId', { userId })
      .andWhere('bu."blogId" = :blogId', { blogId })
      .getRawOne();

    return !!result?.isBanned;
  }

  async doesBlogExist(blogId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
  SELECT COUNT(*)
    FROM public."blogs"
        WHERE "id" = $1`,
      [blogId],
    );
    return +result[0].count === 1;
  }
}
