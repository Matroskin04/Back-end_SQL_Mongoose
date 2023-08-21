import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCommentByPostIdModel {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @IsString({ message: 'It should be a string' })
  @Length(20, 300)
  content: string;
}
