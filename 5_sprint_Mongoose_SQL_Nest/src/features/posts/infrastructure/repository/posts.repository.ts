import { PostInstanceType } from './posts.types.repositories';
import { ObjectId } from 'mongodb';
import { PostModelType } from '../../domain/posts.db.types';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../../domain/posts.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}

  async getPostById(postId: ObjectId): Promise<null | PostInstanceType> {
    const post = await this.PostModel.findOne({ _id: postId });
    return post;
  }

  async save(post: PostInstanceType): Promise<void> {
    await post.save();
    return;
  }

  async createPosts(posts): Promise<void> {
    await this.PostModel.insertMany(posts);
    return;
  } //todo типизация

  async deleteSinglePost(postId: ObjectId, blogId: string): Promise<boolean> {
    const result = await this.PostModel.deleteOne({
      _id: postId,
      blogId: blogId,
    });

    return result.deletedCount === 1;
  }

  async deletePostsByUserId(userId: string): Promise<boolean> {
    const result = await this.PostModel.deleteMany({ userId });
    return result.deletedCount > 0;
  }
}
