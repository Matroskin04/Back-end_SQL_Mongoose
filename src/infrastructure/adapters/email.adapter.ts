import nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../configuration/configuration';

@Injectable()
export class EmailAdapter {
  constructor(private configService: ConfigService<ConfigType>) {}
  async sendEmailConfirmationMessage(
    email: string,
    subject: string,
    message: string,
  ): Promise<boolean> {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'itincubator9@gmail.com',
          pass: this.configService.get('credentials', {
            infer: true,
          })!.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: 'Егор Матафонов <itincubator9@gmail.com>', // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        html: message, // plain text body
      });
      return true;
    } catch (e) {
      console.log('emailAdapter => sendEmailConfirmation => error:', e);
      return false;
    }
  }

  async sendEmailPasswordRecovery(
    email: string,
    subject: string,
    message: string,
  ): Promise<boolean> {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'itincubator9@gmail.com',
          pass: this.configService.get('credentials', {
            infer: true,
          })!.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: 'Егор Матафонов <itincubator9@gmail.com>', // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        html: message, // plain text body
      });
      return true;
    } catch (e) {
      console.log('emailAdapter => sendEmailConfirmation => error:', e);
      return false;
    }
  }
}
