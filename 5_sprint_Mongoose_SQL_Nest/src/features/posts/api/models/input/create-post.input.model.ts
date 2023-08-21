import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  MaxLength,
  Validate,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { IsBlogByIdExistsConstraint } from '../../../../../infrastructure/decorators/posts/blog-id-exists.decorator';

export class CreatePostInputModel {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @IsString({ message: 'It should be a string' })
  @MaxLength(30)
  title: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @IsString({ message: 'It should be a string' })
  @MaxLength(100)
  shortDescription: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @IsString({ message: 'It should be a string' })
  @MaxLength(1000)
  content: string;

  @IsMongoId()
  @IsString({ message: 'It should be a string' })
  @Validate(IsBlogByIdExistsConstraint)
  blogId: string;
}

export class CreatePostByBlogIdModel {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @IsString({ message: 'It should be a string' })
  @MaxLength(30)
  title: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @IsString({ message: 'It should be a string' })
  @MaxLength(100)
  shortDescription: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @IsString({ message: 'It should be a string' })
  @MaxLength(1000)
  content: string;
}
