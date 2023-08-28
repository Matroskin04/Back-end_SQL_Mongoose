import {
  BodyPostByBlogIdType,
  BodyPostType,
  PostTypeWithId,
} from '../infrastructure/repository/posts.types.repositories';
import { PostsRepository } from '../infrastructure/repository/posts.repository';
import { ObjectId } from 'mongodb';
import { modifyPostIntoViewModel } from '../../../infrastructure/utils/functions/features/posts.functions.helpers';
import { PostModelType } from '../domain/posts.db.types';
import { Post } from '../domain/posts.entity';
import { InjectModel } from '@nestjs/mongoose';
import { LikesInfoQueryRepository } from '../../likes-info/infrastructure/query.repository/likes-info.query.repository';
import {
  AllLikeStatusEnum,
  AllLikeStatusType,
} from '../../../infrastructure/utils/enums/like-status';
import { UsersSAQueryRepository } from '../../users/super-admin/infrastructure/query.repository/users-sa.query.repository';
import { LikesInfoService } from '../../likes-info/application/likes-info.service';
import { PostsQueryRepository } from '../infrastructure/query.repository/posts.query.repository';
import { LikesInfoRepository } from '../../likes-info/infrastructure/repository/likes-info.repository';
import { BodyForUpdatePostDto } from './dto/body-for-update-post.dto';
import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../../blogs/infrastructure/query.repository/blogs.query.repository';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    protected postsRepository: PostsRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected blogsPublicQueryRepository: BlogsQueryRepository,
    protected usersQueryRepository: UsersSAQueryRepository,
    protected likesInfoQueryRepository: LikesInfoQueryRepository,
    protected likesInfoRepository: LikesInfoRepository,
    protected likesInfoService: LikesInfoService,
  ) {}

  async createPostByBlogId(
    blogId: string,
    userId: string,
    postDTO: BodyPostByBlogIdType,
  ): Promise<null | PostTypeWithId> {
    //checking the existence of a blog
    const blog = await this.blogsPublicQueryRepository.getBlogAllInfoById(
      blogId,
    );
    if (!blog) {
      return null;
    }

    const post = await this.postsRepository.createPost(postDTO, blogId, userId);

    //find last 3 Likes
    // const newestLikes =
    //   await this.likesInfoQueryRepository.getNewestLikesOfPost(
    //     post._id.toString(),
    //   );
    // const reformedNewestLikes = reformNewestLikes(newestLikes);

    const postMapped = modifyPostIntoViewModel(post, blog.name, [], 'None');

    return postMapped;
  }
  /*
  async updatePost(id: string, inputBodyPost: BodyPostType): Promise<boolean> {
    const blog = await this.blogsBloggerQueryRepository.getBlogById(
      inputBodyPost.blogId,
    );

    if (!blog) {
      throw new BadRequestException([
        {
          message: 'Such blogId is not found',
          field: 'blogId',
        },
      ]);
    }

    const post = await this.postsRepository.getPostById(new ObjectId(id));
    if (!post) return false;

    post.updatePostInfo(post, inputBodyPost);
    await this.postsRepository.save(post);

    return true;
  }
*/

  async updatePostByBlogId(
    blogId: string,
    postId: string,
    postDTO: BodyForUpdatePostDto,
  ) {
    return this.postsRepository.updatePost(postDTO, postId);
  }

  async updateLikeStatusOfPost(
    postId: string,
    userId: string,
    likeStatus: AllLikeStatusType,
  ) {
    const post = await this.postsQueryRepository.doesPostExist(postId);
    if (!post) {
      return false;
    }
    //check of existing LikeInfo
    const likeInfo = await this.likesInfoQueryRepository.getLikesInfoPost(
      postId,
      userId,
    );
    //если не существует likeInfo, то у пользователя 'None'
    if (!likeInfo) {
      if (likeStatus === 'None') return true; //Если статусы совпадают, то ничего не делаем
      //Иначе create like info
      await this.likesInfoRepository.createLikeInfoOfPost(
        userId,
        postId,
        likeStatus,
      );
    } else {
      //Если существует likeInfo, то:
      if (likeStatus === likeInfo) return true; //Если статусы совпадают, то ничего не делаем;

      //В ином случае меняем статус лайка
      const isUpdate = await this.likesInfoRepository.updatePostLikeInfo(
        userId,
        postId,
        likeStatus,
      );
      if (!isUpdate) {
        //todo имеет ли смысл в проверки
        throw new Error('Like status of the post is not updated');
      }
    }
    return true;
  }

  async deleteSinglePost(postId: string): Promise<boolean> {
    return this.postsRepository.deleteSinglePost(postId);
  }
}
