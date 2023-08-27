import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { ObjectId } from 'mongodb';
import { BlogsSARepository } from '../../../features/blogs/super-admin-blogs/infrastructure/repository/blogs-sa.repository';
import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../../../features/blogs/public-blogs/infrastructure/query.repository/blogs.query.repository';

@ValidatorConstraint({ name: 'IsBlogByIdExists', async: true })
@Injectable()
export class IsBlogByIdExistsConstraint
  implements ValidatorConstraintInterface
{
  constructor(protected blogsPublicQueryRepository: BlogsQueryRepository) {}
  async validate(value: string, args: ValidationArguments | any) {
    const blogId = args.object.blogId;

    const blog = await this.blogsPublicQueryRepository.getBlogAllInfoById(
      blogId,
    );
    return !!blog;
  }

  defaultMessage(args?: ValidationArguments): string {
    return `Blog with such blogId doesn't exist`;
  }
}
