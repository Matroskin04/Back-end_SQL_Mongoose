import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../configuration/configuration';

@Injectable()
export class TelegramAdapter {
  private axiosInstance: AxiosInstance;
  constructor(protected configService: ConfigService<ConfigType>) {
    const token = this.configService.get('bot_tg', { infer: true })!.BOT_TOKEN;
    this.axiosInstance = axios.create({
      baseURL: `https://api.telegram.org/${token}`,
    });
  }

  async setWebhook(baseUrl: string): Promise<void> {
    await this.axiosInstance.post('setWebhook', {
      url: baseUrl + '/api/integrations/telegram',
    });
  }
}
