import { IsEnum } from 'class-validator';
import { AllLikeStatusType } from '../../../../../infrastructure/types/like-status.general.types';

export class UpdatePostLikeStatusModel {
  @IsEnum(['Like', 'Dislike', 'None'], {
    message: 'The value should be one of these: None, Like, Dislike',
  })
  likeStatus: AllLikeStatusType;
}
