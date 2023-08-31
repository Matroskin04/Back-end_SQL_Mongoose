import {
  IsString,
} from 'class-validator';
export class ConfirmationCodeInputModel {
  @IsString({ message: 'It should be a string' })
  code: string;
}
