import { CommentDocument } from '../../domain/comments.db.types';

export type CommentViewType = {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: 'None' | 'Like' | 'Dislike';
  };
};

export type CommentInstanceType = CommentDocument;
