import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Length,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateQuestionInputModel {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Length(10, 500)
  @IsString({ message: 'It should be a string' })
  @ValidateIf((object, value) => value !== null)
  body: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @ValidateIf((object, value) => value !== null)
  correctAnswers: string[];
}

//todo в ts не указывать null?
