import {
  PostPaginationType,
  PostViewType,
} from './posts.types.query.repository';
import { QueryPostInputModel } from '../../../api/models/input/query-post.input.model';
import { variablesForReturn } from '../../../../../infrastructure/utils/functions/variables-for-return.function';
import { modifyPostIntoViewModel } from '../../../../../infrastructure/utils/functions/features/posts.functions.helpers';
import { Injectable } from '@nestjs/common';
import { QueryBlogsInputModel } from '../../../../blogs/api/models/input/queries-blog.input.model';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { AllLikeStatusEnum } from '../../../../../infrastructure/utils/enums/like-status';
import { BlogsQueryRepository } from '../../../../blogs/infrastructure/SQL/query.repository/blogs.query.repository';
import { Posts } from '../../../domain/posts.entity';
import { PostsLikesInfo } from '../../../domain/posts-likes-info.entity';
import { UsersBanInfo } from '../../../../users/domain/users-ban-info.entity';

@Injectable()
export class PostsOrmQueryRepository {
  constructor(
    @InjectRepository(Posts)
    protected postsRepository: Repository<Posts>,
    @InjectRepository(PostsLikesInfo)
    protected postsLikesInfoRepository: Repository<PostsLikesInfo>,
    @InjectDataSource() protected dataSource: DataSource,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {}

  //SQL
  async getAllPostsOfBlog(
    blogId: string,
    query: QueryBlogsInputModel,
    userId: string | null,
  ): Promise<null | PostPaginationType> {
    const blog = await this.blogsQueryRepository.doesBlogExist(blogId);
    if (!blog) return null;

    const { pageNumber, pageSize, sortBy, sortDirection } =
      variablesForReturn(query);

    console.log(sortBy);
    const result = await this.postsRepository
      .createQueryBuilder('p')
      .select([
        'p.id AS id',
        'p.title AS title',
        'p.shortDescription AS "shortDescription"',
        'p.content AS "content"',
        'p.blogId AS "blogId"',
        'p.createdAt AS "createdAt"',
        'b.name AS "blogName"',
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)')
          .from(Posts, 'p')
          .leftJoin('p.blog', 'b')
          .where('b.isBanned = false')
          .andWhere('b.id = :blogId', { blogId });
      }, 'count')
      .addSelect((qb) => this.likesCountBuilder(qb), 'likesCount')
      .addSelect((qb) => this.dislikesCountBuilder(qb), 'dislikesCount')
      .addSelect((qb) => this.myStatusBuilder(qb, userId), 'myStatus')
      .addSelect((qb) => this.newestLikesBuilder(qb), 'newestLikes')
      // .leftJoinAndMapMany(
      //   'p.newestLikes',
      //   'p.postLikeInfo',
      //   'li',
      //   'li."postId" = p."id"',
      //   (qb) => {
      //     qb.select(['li.addedAt', 'li.userId', 'u.login'])
      //       .leftJoin('li.user', 'u')
      //       .where('li."likeStatus" = :like', { like: AllLikeStatusEnum.Like })
      //       .orderBy('li.addedAt', 'DESC')
      //       .limit(3);
      //   },
      // )
      // .leftJoinAndMapMany(
      //   'p.newestLikes',
      //   (subQuery) => {
      //     return subQuery
      //       .select(['li.addedAt', 'li.userId', 'u.login'])
      //       .from(PostsLikesInfo, 'li')
      //       .leftJoin('li.user', 'u')
      //       .leftJoin('li.post', 'p')
      //       .where('li."likeStatus" = :like', { like: AllLikeStatusEnum.Like })
      //       .andWhere('li."postId" = p."id"')
      //       .orderBy('li.addedAt', 'DESC')
      //       .limit(3);
      //   },
      //   'li',
      // );
      .leftJoin('p.blog', 'b')
      .where('b.isBanned = false')
      .andWhere('b.id = :blogId', { blogId })
      .orderBy(sortBy === 'blogName' ? 'b.name' : `p.${sortBy}`, sortDirection)
      .limit(+pageSize)
      .offset((+pageNumber - 1) * +pageSize);

    const postsInfo = await result.getRawMany();

    return {
      pagesCount: Math.ceil((+postsInfo[0]?.count || 1) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +postsInfo[0]?.count || 0,
      items: postsInfo.map((post) => modifyPostIntoViewModel(post)),
    };
  }

  async getAllPosts(
    query: QueryPostInputModel,
    userId: string | null,
  ): Promise<PostPaginationType> {
    const { pageNumber, pageSize, sortBy, sortDirection } =
      variablesForReturn(query);

    const result = await this.postsRepository
      .createQueryBuilder('p')
      .select([
        'p.id AS id',
        'p.title AS title',
        'p.shortDescription AS "shortDescription"',
        'p.content AS "content"',
        'p.blogId AS "blogId"',
        'p.createdAt AS "createdAt"',
        'b.name AS "blogName"',
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)')
          .from(Posts, 'p')
          .leftJoin('p.blog', 'b')
          .where('b.isBanned = false');
      }, 'count')
      .addSelect((qb) => this.likesCountBuilder(qb), 'likesCount')
      .addSelect((qb) => this.dislikesCountBuilder(qb), 'dislikesCount')
      .addSelect((qb) => this.myStatusBuilder(qb, userId), 'myStatus')
      .addSelect((qb) => this.newestLikesBuilder(qb), 'newestLikes')
      .leftJoin('p.blog', 'b')
      .where('b.isBanned = false')
      .orderBy(sortBy === 'blogName' ? 'b.name' : `p.${sortBy}`, sortDirection)
      .limit(+pageSize)
      .offset((+pageNumber - 1) * +pageSize);

    const postsInfo = await result.getRawMany();

    return {
      pagesCount: Math.ceil((+postsInfo[0]?.count || 1) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +postsInfo[0]?.count || 0,
      items: postsInfo.map((post) => modifyPostIntoViewModel(post)),
    };
  }

  async doesPostExist(postId: string): Promise<boolean> {
    const result = await this.postsRepository
      .createQueryBuilder('p')
      .select()
      .leftJoin('p.blog', 'b')
      .where('p.id = :postId', { postId })
      .andWhere('b.isBanned = false')
      .getCount();

    return result === 1;
  }

  async getPostByIdView(
    postId: string,
    userId: string | null,
  ): Promise<null | PostViewType> {
    const result = await this.postsRepository
      .createQueryBuilder('p')
      .select([
        'p.id AS id',
        'p.title AS title',
        'p.shortDescription AS "shortDescription"',
        'p.content AS "content"',
        'p.blogId AS "blogId"',
        'p.createdAt AS "createdAt"',
        'b.name AS "blogName"',
      ])
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)')
          .from(Posts, 'p')
          .leftJoin('p.blog', 'b')
          .where('b.isBanned = false');
      }, 'count')
      .addSelect((qb) => this.likesCountBuilder(qb), 'likesCount')
      .addSelect((qb) => this.dislikesCountBuilder(qb), 'dislikesCount')
      .addSelect((qb) => this.myStatusBuilder(qb, userId), 'myStatus')
      .addSelect((qb) => this.newestLikesBuilder(qb), 'newestLikes')
      .leftJoin('p.blog', 'b')
      .where('b.isBanned = false')
      .andWhere('p.id = :postId', { postId });

    const postInfo = await result.getRawOne();

    return postInfo ? modifyPostIntoViewModel(postInfo) : null;
  }

  async getPostDBInfoById(postId: string): Promise<any> {
    const result = await this.dataSource.query(
      `
    SELECT "blogId", "userId", "title", "shortDescription", "content", "createdAt"
      FROM public."posts"
        WHERE "id" = $1`,
      [postId],
    );
    if (!result[0]) return null;
    return result[0];
  }

  private likesCountBuilder(qb: SelectQueryBuilder<any>) {
    return qb
      .select('COUNT(*)')
      .from(PostsLikesInfo, 'li')
      .leftJoin(UsersBanInfo, 'bi', 'li.userId = bi.userId')
      .where('li."likeStatus" = :like', { like: AllLikeStatusEnum.Like })
      .andWhere('li."postId" = p."id"')
      .andWhere('bi."isBanned" = false');
  }

  private dislikesCountBuilder(qb: SelectQueryBuilder<any>) {
    return qb
      .select('COUNT(*)')
      .from(PostsLikesInfo, 'li')
      .leftJoin(UsersBanInfo, 'bi', 'li.userId = bi.userId')
      .where('li."likeStatus" = :dislike', {
        dislike: AllLikeStatusEnum.Dislike,
      })
      .andWhere('li."postId" = p."id"')
      .andWhere('bi."isBanned" = false');
  }

  private myStatusBuilder(qb: SelectQueryBuilder<any>, userId) {
    return qb
      .select('li.likeStatus')
      .from(PostsLikesInfo, 'li')
      .leftJoin(UsersBanInfo, 'bi', 'li.userId = bi.userId')
      .where('li."userId" = :userId', { userId })
      .andWhere('li."postId" = p."id"')
      .andWhere('bi."isBanned" = false');
  }

  private newestLikesBuilder(qb: SelectQueryBuilder<any>) {
    return qb
      .select('json_agg(to_jsonb("threeLikes")) as "newestLikes"')
      .from((qb) => {
        return qb
          .select([
            'li."addedAt" AS "addedAt"',
            'li."userId" AS "userId"',
            'u."login" AS login',
          ])
          .from(PostsLikesInfo, 'li')
          .leftJoin('li.user', 'u')
          .leftJoin('u.userBanInfo', 'bi')
          .where('li."postId" = p."id"')
          .andWhere('li."likeStatus" = :like', {
            like: AllLikeStatusEnum.Like,
          })
          .andWhere('bi."isBanned" = false');
      }, 'threeLikes');
  }
}
