import { BlogPaginationType } from '../../../../infrastructure/query.repository/blogs-public.types.query.repository';
import { PostPaginationType } from '../../../../../posts/infrastructure/query.repository/posts.types.query.repository';
import { BlogOutputType } from '../../../../infrastructure/repository/blogs-blogger.types.repositories';

export type BlogOutputModel = BlogOutputType;

export type BlogsOutputModel = BlogPaginationType;

export type PostsOfBlogViewModel = PostPaginationType;
