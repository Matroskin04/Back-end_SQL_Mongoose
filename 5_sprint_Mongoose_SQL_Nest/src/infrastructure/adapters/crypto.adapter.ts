import bcrypt from 'bcryptjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CryptoAdapter {
  async _generateHash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
