import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IconOfPost } from '../../../domain/main-img-of-post.entity';
import { PhotoInfoViewType } from '../../../../blogs/infrastructure/typeORM/query.repository/types/photos-for-post.types.query.repository';

@Injectable()
export class PhotosForPostQueryRepository {
  constructor(
    @InjectRepository(IconOfPost)
    protected iconOfPostRepo: Repository<IconOfPost>,
  ) {}

  async getMainImgOfPost(
    postId: string,
    iconOfPostRepo: Repository<IconOfPost> = this.iconOfPostRepo,
  ): Promise<PhotoInfoViewType[] | []> {
    const query = iconOfPostRepo
      .createQueryBuilder()
      .select(['url', 'width', 'height', '"fileSize"'])
      .where('"postId" = :postId', { postId });

    const result = await query.getRawMany();
    return result;
  }
}
