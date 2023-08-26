import {
  BodyPostByBlogIdType,
  PostDBType,
  PostInstanceType,
} from './posts.types.repositories';
import { ObjectId } from 'mongodb';
import { PostModelType } from '../../domain/posts.db.types';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../../domain/posts.entity';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(Post.name)
    private PostModel: PostModelType,
  ) {}

  //SQL
  async createPost(
    postDTO: BodyPostByBlogIdType,
    blogId: string,
    userId: string,
  ): Promise<PostDBType> {
    const result = await this.dataSource.query(
      `
    INSERT INTO public."posts"(
        "title", "shortDescription", "content", "blogId", "userId")
        VALUES ($1, $2, $3, $4, $5)
    RETURNING "id", "title", "shortDescription", "content", "blogId", "userId", "createdAt"`,
      [
        postDTO.title,
        postDTO.shortDescription,
        postDTO.content,
        blogId,
        userId,
      ],
    );
    return result[0];
  }

  async updatePost(
    postDTO: BodyPostByBlogIdType,
    postId: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    UPDATE public."posts"
      SET "title" = $1, "shortDescription" = $2, "content" = $3
        WHERE "id" = $4`,
      [postDTO.title, postDTO.shortDescription, postDTO.content, postId],
    );
    return result[1] === 1;
  }
  //MONGO
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
