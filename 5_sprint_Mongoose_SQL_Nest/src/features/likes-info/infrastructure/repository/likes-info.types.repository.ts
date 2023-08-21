import { HydratedDocument } from 'mongoose';
import {
  CommentLikesInfo,
  PostLikesInfo,
} from '../../domain/likes-info.entity';

export type PostLikeInfoInstanceType = HydratedDocument<PostLikesInfo>;
export type CommentLikeInfoInstanceType = HydratedDocument<CommentLikesInfo>;
