import { BlogDocument } from '../../../domain/blogs.db.types';

export type BodyBlogType = {
  name: string;
  description: string;
  websiteUrl: string;
};

export type BlogInstanceType = BlogDocument;
