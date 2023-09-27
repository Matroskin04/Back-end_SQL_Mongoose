import { IsEnum } from 'class-validator';
import { AllLikeStatusType } from '../../../../../infrastructure/types/like-status.general.types';

export class UpdateCommentLikeStatusInputModel {
  @IsEnum(['Like', 'Dislike', 'None'], {
    message: 'The value should be one of these: None, Like, Dislike',
  })
  likeStatus: AllLikeStatusType;
}
