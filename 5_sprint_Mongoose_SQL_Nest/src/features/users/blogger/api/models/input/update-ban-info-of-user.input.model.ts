import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  Min,
  MinLength,
  Validate,
} from 'class-validator';
import { IsBlogByIdExistsConstraint } from '../../../../../../infrastructure/decorators/posts/blog-id-exists.decorator';

export class UpdateBanInfoOfUserInputModel {
  @IsBoolean({ message: 'The value should be true/false' })
  isBanned: boolean;

  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @IsString({ message: 'It should be a string' })
  @MinLength(20)
  banReason: string;

  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @IsString({ message: 'It should be a string' })
  @Validate(IsBlogByIdExistsConstraint)
  blogId: string;
}
