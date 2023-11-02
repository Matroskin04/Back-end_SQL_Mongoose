import { ConfigModule } from '@nestjs/config';
import { getConfiguration } from './configuration';
export const configModule = ConfigModule.forRoot({
  isGlobal: true, //need that configService can inject in all files
  load: [getConfiguration], //set special configuration
});
