import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AllBlogsSAOutputModel } from './models/output/blog-sa.output.model';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';
import { BasicAuthGuard } from '../../../infrastructure/guards/authorization-guards/basic-auth.guard';
import { BanInfoInputModel } from './models/input/ban-info.input.model';
import {
  QueryBlogsInputModel,
  QueryPostsOfBlogInputModel,
} from './models/input/queries-blog.input.model';
import { CommandBus } from '@nestjs/cqrs';
import { BindBlogWithUserCommand } from '../application/sa/use-cases/bind-blog-with-user.use-case';
import { UpdateBanInfoOfBlogCommand } from '../application/sa/use-cases/update-ban-info-of-blog.use-case';
import { BlogsOrmQueryRepository } from '../infrastructure/typeORM/query.repository/blogs-orm.query.repository';
import {
  BlogOutputModel,
  PostsOfBlogViewModel,
} from './models/output/blog.output.models';
import { PostsOrmQueryRepository } from '../../posts/infrastructure/typeORM/query.repository/posts-orm.query.repository';
import { CreateBlogInputModel } from './models/input/create-blog.input.model';
import { CreateBlogCommand } from '../application/blogger/use-cases/create-blog.use-case';
import { CreatePostByBlogIdModel } from '../../posts/api/models/input/create-post.input.model';
import { PostTypeWithId } from '../../posts/infrastructure/SQL/repository/posts.types.repositories';
import { CreatePostCommand } from '../../posts/application/use-cases/create-post.use-case';
import { UpdateBlogInputModel } from './models/input/update-blog.input.model';
import { UpdateBlogCommand } from '../application/blogger/use-cases/update-blog.use-case';
import { UpdatePostByBlogIdInputModel } from './models/input/update-post-by-blog-id.input.model';
import { UpdatePostCommand } from '../../posts/application/use-cases/update-post.use-case';
import { DeleteBlogCommand } from '../application/blogger/use-cases/delete-blog.use-case';
import { DeletePostCommand } from '../../posts/application/use-cases/delete-post.use-case';

@Controller('/hometask-nest/sa/blogs')
export class BlogsSAController {
  constructor(
    protected commandBus: CommandBus,
    protected postsOrmQueryRepository: PostsOrmQueryRepository,
    protected blogsOrmQueryRepository: BlogsOrmQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getAllBlogs(
    @Query() query: QueryBlogsInputModel,
  ): Promise<AllBlogsSAOutputModel> {
    const result = await this.blogsOrmQueryRepository.getAllBlogsSA(query);
    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Get(':blogId/posts')
  async getAllPostsOfBlog(
    @Param('blogId') blogId: string,
    @Query() query: QueryPostsOfBlogInputModel,
  ): Promise<PostsOfBlogViewModel> {
    const result = await this.postsOrmQueryRepository.getAllPostsOfBlog(
      blogId,
      query,
      null,
    );
    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HTTP_STATUS_CODE.CREATED_201)
  @Post()
  async createBlog(
    @Body() inputBlogModel: CreateBlogInputModel,
  ): Promise<BlogOutputModel> {
    const result = await this.commandBus.execute(
      new CreateBlogCommand(inputBlogModel, null),
    );
    return result;
  }

  @UseGuards(BasicAuthGuard)
  @Post(`/:blogId/posts`)
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() inputPostModel: CreatePostByBlogIdModel,
  ): Promise<PostTypeWithId> {
    const result = await this.commandBus.execute(
      new CreatePostCommand(blogId, null, inputPostModel),
    );
    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Put(':blogId')
  async updateBlog(
    @Param('blogId') blogId: string,
    @Body() inputBlogModel: UpdateBlogInputModel,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new UpdateBlogCommand(inputBlogModel, blogId),
    );
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Put(':blogId/posts/:postId')
  async updatePostOfBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() inputPostModel: UpdatePostByBlogIdInputModel,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new UpdatePostCommand(blogId, postId, inputPostModel),
    );

    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Delete(':blogId')
  async deleteBlog(@Param('blogId') blogId: string): Promise<void> {
    const result = await this.commandBus.execute(new DeleteBlogCommand(blogId));
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Delete(':blogId/posts/:postId')
  async deletePostOfBlog(
    @Param('postId') postId: string,
    @Param('blogId') blogId: string,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new DeletePostCommand(postId, blogId),
    );
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Put(':id/ban')
  async updateBanInfoOfBlog(
    @Param('id') blogId: string,
    @Body() inputBanInfoModel: BanInfoInputModel,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new UpdateBanInfoOfBlogCommand(blogId, inputBanInfoModel.isBanned),
    );
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Put(':id/bind-with-user/:userId')
  async bindBlogWithUser(
    @Param('id') blogId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new BindBlogWithUserCommand(blogId, userId),
    );
    if (!result) throw new NotFoundException();
    return;
  }

  /*@Get(':id')
  async getBlogById(
    @Param('id') blogId: string,
    @Res() res: Response<BlogOutputModels>,
  ) {
    const result = await this.blogsQueryRepository.getBlogById(blogId);
    result
      ? res.status(HTTP_STATUS_CODE.OK_200).send(result)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @UseGuards(JwtAccessNotStrictGuard)
  @Get(':blogId/posts')
  async getAllPostsOfBlog(
    @Param('blogId') blogId: string,
    @CurrentUserId() userId: ObjectId,
    @Query() query: QueryBlogInputModel,
    @Res() res: Response<ViewPostsOfBlogModel>,
  ) {
    const result = await this.postsQueryRepository.getPostsOfBlog(
      blogId,
      query,
      userId,
    );
    result
      ? res.status(HTTP_STATUS_CODE.OK_200).send(result)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(
    @Body() inputBlogModel: CreateBlogInputModel,
    @Res() res: Response<BlogOutputModels>,
  ) {
    const result = await this.blogsService.createBlog(inputBlogModel);
    res.status(HTTP_STATUS_CODE.CREATED_201).send(result);
  }

  @UseGuards(BasicAuthGuard)
  @Post(`/:blogId/posts`)
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() inputPostModel: CreatePostByBlogIdModel,
    @Res() res: Response<PostTypeWithId>,
  ) {
    const result = await this.postsService.createPostByBlogId(
      blogId,
      inputPostModel,
    );
    result
      ? res.status(HTTP_STATUS_CODE.CREATED_201).send(result)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  async updateBlog(
    @Param('id') blogId: string,
    @Body() inputBlogModel: UpdateBlogInputModel,
    @Res() res: Response<void>,
  ) {
    const result = await this.blogsService.updateBlog(blogId, inputBlogModel);
    result
      ? res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  async deleteBlog(@Param('id') blogId: string, @Res() res: Response<void>) {
    const result = await this.blogsService.deleteSingleBlog(blogId);
    result
      ? res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }*/
}
