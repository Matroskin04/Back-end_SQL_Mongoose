import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateQuestionQuizInputModel {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty({ message: 'The field shouldn\t be empty' })
  @IsString({ message: 'It should be a string' })
  @Length(10, 500)
  body: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  correctAnswers: string[];
}
