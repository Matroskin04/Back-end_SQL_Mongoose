import { IsString } from 'class-validator';

export class SendAnswerInputModel {
  @IsString()
  answer: string;
}
