import { Injectable } from '@nestjs/common';
import { EmailAdapter } from '../adapters/email.adapter';

@Injectable()
export class EmailManager {
  constructor(protected emailAdapter: EmailAdapter) {}

  async sendEmailConfirmationMessage(
    email: string,
    code: string,
  ): Promise<void> {
    const message = `<h1>Thank you for registration!</h1>
<p>Please, follow the link to finish your registration:<a href='https://www.youtube.com/?code=${code}'>complete registration</a></p>`;
    await this.emailAdapter.sendEmailConfirmationMessage(
      email,
      `Confirmation Email`,
      message,
    );
    return;
  }

  async sendEmailPasswordRecovery(email: string, code: string): Promise<void> {
    const message = `<h1>Password recovery</h1>
       <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${code}'>recovery password</a>
      </p>`;

    await this.emailAdapter.sendEmailPasswordRecovery(
      email,
      `Password recovery`,
      message,
    );
    return;
  }
}
