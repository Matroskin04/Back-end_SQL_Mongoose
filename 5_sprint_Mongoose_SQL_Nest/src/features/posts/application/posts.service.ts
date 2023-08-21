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
import { reformNewestLikes } from '../../../infrastructure/utils/functions/features/likes-info.functions.helpers';
import { LikeStatus } from '../../../infrastructure/utils/enums/like-status';
import { UsersSAQueryRepository } from '../../users/super-admin/infrastructure/query.repository/users-sa.query.repository';
import { LikesInfoService } from '../../likes-info/application/likes-info.service';
import { PostsQueryRepository } from '../infrastructure/query.repository/posts.query.repository';
import { LikesInfoRepository } from '../../likes-info/infrastructure/repository/likes-info.repository';
import { BlogsSARepository } from '../../blogs/super-admin-blogs/infrastructure/repository/blogs-sa.repository';
import { BlogsBloggerQueryRepository } from '../../blogs/blogger-blogs/infrastructure/query.repository/blogs-blogger.query.repository';
import { BodyForUpdatePostDto } from './dto/body-for-update-post.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    protected postsRepository: PostsRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected blogsBloggerQueryRepository: BlogsBloggerQueryRepository,
    protected blogsRepository: BlogsSARepository,
    protected usersQueryRepository: UsersSAQueryRepository,
    protected likesInfoQueryRepository: LikesInfoQueryRepository,
    protected likesInfoRepository: LikesInfoRepository,
    protected likesInfoService: LikesInfoService,
  ) {}

  /* async createPost(inputBodyPost: BodyPostType): Promise<PostViewType> {
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

    const post = this.PostModel.createInstance(
      inputBodyPost,
      blog.name,
      this.PostModel,
    );
    await this.postsRepository.save(post);

    //find last 3 Likes
    const newestLikes =
      await this.likesInfoQueryRepository.getNewestLikesOfPost(post._id);
    const reformedNewestLikes = reformNewestLikes(newestLikes);

    const postMapped = modifyPostIntoViewModel(
      post,
      reformedNewestLikes,
      'None',
    );

    return postMapped;
  }*/

  async createPostByBlogId(
    blogId: string,
    userId: ObjectId,
    inputBodyPost: BodyPostByBlogIdType,
  ): Promise<null | PostTypeWithId> {
    //checking the existence of a blog
    const blog = await this.blogsRepository.getBlogInstance(
      new ObjectId(blogId),
    );
    if (!blog) {
      return null;
    }

    const bodyPostWithBlogId: BodyPostType = {
      ...inputBodyPost,
      userId: userId.toString(),
      blogId: blog.id,
    };

    const post = this.PostModel.createInstance(
      bodyPostWithBlogId,
      blog.name,
      this.PostModel,
    );
    await this.postsRepository.save(post);

    //find last 3 Likes
    const newestLikes =
      await this.likesInfoQueryRepository.getNewestLikesOfPost(
        post._id.toString(),
      );
    const reformedNewestLikes = reformNewestLikes(newestLikes);

    const postMapped = modifyPostIntoViewModel(
      post,
      reformedNewestLikes,
      'None',
    );

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
    inputBodyPost: BodyForUpdatePostDto,
  ) {
    const blog = await this.blogsBloggerQueryRepository.getBlogById(
      new ObjectId(blogId),
    );
    if (!blog) return false;

    const post = await this.postsRepository.getPostById(new ObjectId(postId));
    if (!post) return false;

    post.updatePostInfo(post, inputBodyPost);
    await this.postsRepository.save(post);

    return true;
  }

  async updateLikeStatusOfPost(
    postId: string,
    userId: ObjectId,
    likeStatus: LikeStatus,
  ) {
    const post = await this.postsQueryRepository.getPostById(
      new ObjectId(postId),
      userId,
    );
    if (!post) {
      return false;
    }
    //check of existing LikeInfo
    const likeInfo =
      await this.likesInfoQueryRepository.getLikesInfoByPostAndUser(
        postId,
        userId.toString(),
      );
    //если не существует, то у пользователя 'None'
    if (!likeInfo) {
      if (likeStatus === 'None') return true; //Если статусы совпадают, то ничего не делаем
      //Иначе увеличиваем количество лайков/дизлайков
      const result =
        await this.likesInfoRepository.incrementNumberOfLikesOfPost(
          postId,
          likeStatus,
        );
      if (!result) {
        throw new Error('Incrementing number of likes failed');
      }
      //Создаем like info
      const user = await this.usersQueryRepository.getUserByUserId(userId);
      if (!user) {
        throw new Error('User with this userId is not found');
      }

      await this.likesInfoService.createLikeInfoPost(
        userId.toString(),
        postId,
        user.login,
        likeStatus,
      );

      return true;
    }

    //Если существует likeInfo, то:
    if (likeStatus === likeInfo.statusLike) return true; //Если статусы совпадают, то ничего не делаем;

    //В ином случае меняем статус лайка
    const isUpdate = await this.likesInfoService.updatePostLikeInfo(
      userId.toString(),
      postId,
      likeStatus,
    );
    if (!isUpdate) {
      throw new Error('Like status of the post is not updated');
    }

    const result1 = await this.likesInfoRepository.incrementNumberOfLikesOfPost(
      postId,
      likeStatus,
    );
    if (!result1) {
      throw new Error('Incrementing number of likes failed');
    }
    //уменьшаю на 1 то что убрали
    const result2 = await this.likesInfoRepository.decrementNumberOfLikesOfPost(
      postId,
      likeInfo.statusLike,
    );
    if (!result2) {
      throw new Error('Decrementing number of likes failed');
    }

    return true;
  }

  async deleteSinglePost(postId: string, blogId: string): Promise<boolean> {
    return this.postsRepository.deleteSinglePost(new ObjectId(postId), blogId);
  }
}
