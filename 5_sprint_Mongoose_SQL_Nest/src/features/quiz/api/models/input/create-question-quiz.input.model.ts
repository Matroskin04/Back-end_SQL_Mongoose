import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateQuestionQuizInputModel {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(10, 500)
  @IsString({ message: 'It should be a string' })
  body: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  correctAnswers: string[];
}
