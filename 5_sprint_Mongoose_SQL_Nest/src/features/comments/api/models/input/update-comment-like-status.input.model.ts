import {
  AllLikeStatusEnum,
  AllLikeStatusType,
} from '../../../../../infrastructure/utils/enums/like-status';
import { IsEnum } from 'class-validator';

export class UpdateCommentLikeStatusInputModel {
  @IsEnum(['Like', 'Dislike', 'None'], {
    message: 'The value should be one of these: None, Like, Dislike',
  })
  likeStatus: AllLikeStatusType;
}
