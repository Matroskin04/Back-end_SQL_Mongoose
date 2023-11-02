import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCommentByPostIdModel {
  @IsString({ message: 'It should be a string', each: true })
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @Length(20, 300)
  content: string;
}
