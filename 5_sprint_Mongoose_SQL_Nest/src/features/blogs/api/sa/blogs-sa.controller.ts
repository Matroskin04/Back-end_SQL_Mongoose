import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AllBlogsSAOutputModel } from '../models/output/blog-sa.output.model';
import { HTTP_STATUS_CODE } from '../../../../infrastructure/utils/enums/http-status';
import { BasicAuthGuard } from '../../../../infrastructure/guards/authorization-guards/basic-auth.guard';
import { BlogsSAService } from '../../application/sa/blogs-sa.service';
import { BanInfoInputModel } from '../models/input/ban-info.input.model';
import { BlogsQueryRepository } from '../../infrastructure/query.repository/blogs.query.repository';
import { QueryBlogsInputModel } from '../models/input/queries-blog.input.model';
import { CommandBus } from '@nestjs/cqrs';
import { BindBlogWithUserCommand } from '../../application/sa/use-cases/bind-blog-with-user.use-case';

@SkipThrottle()
@Controller('/hometask-nest/sa/blogs')
export class BlogsSAController {
  constructor(
    protected commandBus: CommandBus,
    protected blogsPublicQueryRepository: BlogsQueryRepository,
    protected blogsSAService: BlogsSAService,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getAllBlogs(
    @Query() query: QueryBlogsInputModel,
  ): Promise<AllBlogsSAOutputModel> {
    const result = await this.blogsPublicQueryRepository.getAllBlogsSA(query);
    return result;
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

  @UseGuards(BasicAuthGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Put(':id/ban')
  async updateBanInfoOfBlog(
    @Param('id') blogId: string,
    @Body() inputBanInfoModel: BanInfoInputModel,
  ): Promise<void> {
    const result = await this.blogsSAService.updateBanInfoOfBlog(
      blogId,
      inputBanInfoModel.isBanned,
    );
    if (!result) throw new NotFoundException();
    return;
  }

  /* @Get(':id')
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
