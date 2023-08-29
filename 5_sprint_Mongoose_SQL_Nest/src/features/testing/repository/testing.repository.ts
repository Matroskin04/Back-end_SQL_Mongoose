import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { CommentModelType } from '../../comments/domain/comments.db.types';
import { Comment } from '../../comments/domain/comments.entity';
import { CommentLikesInfo } from '../../likes-info/domain/likes-info.entity';
import { CommentLikesInfoModelType } from '../../likes-info/domain/likes-info.db.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestingRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    @InjectModel(CommentLikesInfo.name)
    private CommentLikesInfoModel: CommentLikesInfoModelType,
  ) {}
  async deleteAllData(): Promise<void> {
    return Promise.all([
      this.CommentModel.deleteMany({}),
      this.CommentLikesInfoModel.deleteMany({}),
      this.dataSource.query(`
      TRUNCATE public."users" CASCADE`),
    ]).then(
      (value) => {
        console.log('OK');
      },
      (reason) => {
        console.log(reason);
      },
    );
  }
}
