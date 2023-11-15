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
      baseURL: `https://api.telegram.org/bot${token}`,
    });
  }

  async sendWebhook(baseUrl: string): Promise<void> {
    await this.axiosInstance.post('setWebhook', {
      url: baseUrl + '/api/integrations/telegram/webhook',
    });
  }

  async sendMessage(text: string, chatId: number): Promise<void> {
    await this.axiosInstance.post('sendMessage', { text, chat_id: chatId });
  }
}
