import {
  BlogPaginationType,
  BlogOutputType,
  BlogAllInfoOutputType,
} from './types/blogs-public.types.query.repository';
import { Injectable } from '@nestjs/common';
import { QueryBlogsInputModel } from '../../../api/models/input/queries-blog.input.model';
import { variablesForReturn } from '../../../../../infrastructure/utils/functions/variables-for-return.function';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { AllBlogsSAViewType } from './types/blogs-sa.types.query.repository';
import { Blogs } from '../../../domain/blogs.entity';
import { BannedUsersOfBlog } from '../../../domain/banned-users-of-blog.entity';
import {
  modifyBlogIntoViewGeneralModel,
  modifyBlogIntoViewSAModel,
} from '../../../../../infrastructure/utils/functions/features/blog.functions.helpers';
import { IconOfBlog } from '../../../domain/icon-of-blog.entity';
import { WallpaperOfBlog } from '../../../domain/wallpaper-of-blog.entity';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../../../../configuration/configuration';
import { SubscribersOfBlog } from '../../../domain/subscribers-of-blog.entity';

@Injectable()
export class BlogsOrmQueryRepository {
  constructor(
    @InjectRepository(Blogs)
    protected blogsRepository: Repository<Blogs>,
    @InjectRepository(BannedUsersOfBlog)
    protected bannedUsersOfBlogRepository: Repository<BannedUsersOfBlog>,
    @InjectDataSource() protected dataSource: DataSource,
    protected configService: ConfigService<ConfigType>,
  ) {}

  async getAllBlogsOfBlogger(
    queryParams: QueryBlogsInputModel,
    userId: string,
  ): Promise<BlogPaginationType> {
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
      ])
      .addSelect(
        (qb) => this.blogsOfBloggerCountBuilder(qb, searchNameTerm, userId),
        'count',
      )
      .addSelect((qb) => this.iconsOfBlogBuilder(qb), 'icons')
      .addSelect((qb) => this.wallpaperOfBlogBuilder(qb), 'wallpaper')
      .addSelect(
        (qb) => this.subscribersCountOfBlogBuilder(qb),
        'subscribersCount',
      )
      .addSelect(
        (qb) => this.subscriptionStatusOfBlogBuilder(qb, userId),
        'subscriptionStatus',
      )
      .where('b.name ILIKE :name', { name: `%${searchNameTerm}%` })
      .andWhere('b.userId = :userId', { userId })
      .orderBy(`b.${sortBy}`, sortDirection)
      .limit(+pageSize)
      .offset((+pageNumber - 1) * +pageSize);

    const result = await query.getRawMany();

    return {
      pagesCount: Math.ceil((+result[0]?.count || 1) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +result[0]?.count || 0,
      items: result.map((blog) =>
        modifyBlogIntoViewGeneralModel(blog, this.configService),
      ),
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
      .addSelect((qb) => this.allBlogsCountBuilder(qb, searchNameTerm), 'count')
      .leftJoin('b.user', 'u')
      .where('b.name ILIKE :name', { name: `%${searchNameTerm}%` })
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
    userId: string | null,
  ): Promise<BlogPaginationType> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
      variablesForReturn(query);

    const result = await this.blogsRepository
      .createQueryBuilder('b')
      .select([
        'b."id"',
        'b."name"',
        'b."description"',
        'b."websiteUrl"',
        'b."createdAt"',
        'b."isMembership"',
      ])
      .addSelect((qb) => this.allBlogsCountBuilder(qb, searchNameTerm), 'count')
      .addSelect((qb) => this.iconsOfBlogBuilder(qb), 'icons')
      .addSelect((qb) => this.wallpaperOfBlogBuilder(qb), 'wallpaper')
      .addSelect(
        (qb) => this.subscribersCountOfBlogBuilder(qb),
        'subscribersCount',
      )
      .addSelect(
        (qb) => this.subscriptionStatusOfBlogBuilder(qb, userId),
        'subscriptionStatus',
      )
      .where('b.name ILIKE :name', { name: `%${searchNameTerm}%` })
      .andWhere('b.isBanned = false')
      .orderBy(`b.${sortBy}`, sortDirection)
      .limit(+pageSize)
      .offset((+pageNumber - 1) * +pageSize)
      .getRawMany();

    return {
      pagesCount: Math.ceil((+result[0]?.count || 1) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +result[0]?.count || 0,
      items: result.map((blog) =>
        modifyBlogIntoViewGeneralModel(blog, this.configService),
      ),
    };
  }

  async getBlogByIdPublic(blogId: string): Promise<null | BlogOutputType> {
    const result = await this.blogsRepository
      .createQueryBuilder('b')
      .select([
        'b."id"',
        'b."name"',
        'b."description"',
        'b."websiteUrl"',
        'b."createdAt"',
        'b."isMembership"',
      ])
      .addSelect((qb) => this.iconsOfBlogBuilder(qb), 'icons')
      .addSelect((qb) => this.wallpaperOfBlogBuilder(qb), 'wallpaper')
      .where('b.id = :blogId', { blogId })
      .andWhere('b."isBanned" = false')
      .getRawOne();

    return result
      ? modifyBlogIntoViewGeneralModel(result, this.configService)
      : null;
  }

  async getBlogAllInfoById(
    blogId: string,
  ): Promise<null | BlogAllInfoOutputType> {
    const result = await this.blogsRepository
      .createQueryBuilder('b')
      .select([
        'b."id"',
        'b."name"',
        'b."description"',
        'b."websiteUrl"',
        'b."createdAt"',
        'b."isMembership"',
        'b."isBanned"',
        'b."userId"',
      ])
      .where('b.id = :blogId', { blogId })
      .getRawOne();

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

  private allBlogsCountBuilder(
    qb: SelectQueryBuilder<Blogs>,
    searchNameTerm: string,
  ) {
    return qb
      .select('COUNT(*)')
      .from(Blogs, 'b')
      .where('b.name ILIKE :name', { name: `%${searchNameTerm}%` });
  }

  private blogsOfBloggerCountBuilder(
    qb: SelectQueryBuilder<Blogs>,
    searchNameTerm: string,
    userId: string,
  ) {
    return qb
      .select('COUNT(*)')
      .from(Blogs, 'b')
      .where('b.name ILIKE :name', { name: `%${searchNameTerm}%` })
      .andWhere('b.userId = :userId', { userId });
  }

  private iconsOfBlogBuilder(qb: SelectQueryBuilder<Blogs>) {
    return qb.select('json_agg(to_jsonb("icons"))').from((qb) => {
      return qb
        .select(['i."url"', 'i."width"', 'i."height"', 'i."fileSize"'])
        .from(IconOfBlog, 'i')
        .where('i."blogId" = b."id"');
    }, 'icons');
  }

  private wallpaperOfBlogBuilder(qb: SelectQueryBuilder<Blogs>) {
    return qb.select('to_jsonb("wallpaper")').from((qb) => {
      return qb
        .select(['w."url"', 'w."width"', 'w."height"', 'w."fileSize"'])
        .from(WallpaperOfBlog, 'w')
        .where('w."blogId" = b."id"');
    }, 'wallpaper');
  }

  private subscribersCountOfBlogBuilder(qb: SelectQueryBuilder<Blogs>) {
    return qb
      .select('COUNT(*)')
      .from(SubscribersOfBlog, 'subs')
      .where('subs."blogId" = b.id');
  }

  private subscriptionStatusOfBlogBuilder(
    qb: SelectQueryBuilder<Blogs>,
    userId: string | null,
  ) {
    return qb
      .select('subs."subscriptionStatus"')
      .from(SubscribersOfBlog, 'subs')
      .where('subs."blogId" = b.id')
      .andWhere('subs."userId" = :userId', { userId });
  }
}
