import { BlogPaginationType } from '../../../infrastructure/SQL/query.repository/blogs-public.types.query.repository';
import { PostPaginationType } from '../../../../posts/infrastructure/SQL/query.repository/posts.types.query.repository';
import { BlogOutputType } from '../../../infrastructure/SQL/repository/blogs-blogger.types.repositories';

export type BlogOutputModel = BlogOutputType;

export type BlogsOutputModel = BlogPaginationType;

export type PostsOfBlogViewModel = PostPaginationType;
