import { BlogDocument } from '../../../domain/blogs.db.types';

export type BlogType = {
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

export type BlogInstanceType = BlogDocument;
