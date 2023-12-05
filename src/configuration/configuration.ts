import process from 'process';

export const getConfiguration = () => ({
  db: {
    mongo: {
      MONGO_URL: process.env.MONGO_URL ?? 'mongodb://0.0.0.0:27017',
    },
    postgresqlLocal: {
      POSTGRES_URL: process.env.POSTGRES_URL_TEST,
      POSTGRES_USER: process.env.POSTGRES_USER_TEST,
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD_TEST,
      POSTGRES_HOST: process.env.POSTGRES_HOST_TEST,
      POSTGRES_PORT: process.env.POSTGRES_PORT_TEST,
      POSTGRES_DATABASE: process.env.POSTGRES_DATABASE_TEST,
    },
    postgresqlRemote: {
      POSTGRES_URL: process.env.POSTGRES_URL,
      POSTGRES_USER: process.env.POSTGRES_USER,
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
      POSTGRES_HOST: process.env.POSTGRES_HOST,
      POSTGRES_PORT: process.env.POSTGRES_PORT,
      POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,
    },
  },
  app: {
    CURRENT_APP_BASE_URL:
      process.env.CURRENT_APP_BASE_URL || 'https://localhost:5000',
    NODE_ENV: process.env.NODE_ENV || 'development',
  },
  jwt: {
    PRIVATE_KEY_ACCESS_TOKEN: process.env.PRIVATE_KEY_ACCESS_TOKEN ?? '123',
    PRIVATE_KEY_REFRESH_TOKEN: process.env.PRIVATE_KEY_REFRESH_TOKEN ?? '234',
    EXPIRATION_TIME_ACCESS_TOKEN:
      process.env.EXPIRATION_TIME_ACCESS_TOKEN ?? '10s',
    EXPIRATION_TIME_REFRESH_TOKEN:
      process.env.EXPIRATION_TIME_REFRESH_TOKEN ?? '20s',
  },
  credentials: {
    EMAIL_PASS: process.env.EMAIL_PASS,
    SA_LOGIN: process.env.SA_LOGIN,
    SA_PASS: process.env.SA_PASS,
  },
  S3: {
    BUCKET_NAME: process.env.BUCKET_NAME || 'content-platform',
    URL:
      process.env.S3_URL || 'https://content-platform.storage.yandexcloud.net/',
  },
  photoInfo: {
    BLOG_ICON_WIDTH: Number(process.env.BLOG_ICON_WIDTH) || 156,
    BLOG_ICON_HEIGHT: Number(process.env.BLOG_ICON_HEIGHT) || 156,
    BLOG_WALLPAPER_WIDTH: Number(process.env.BLOG_WALLPAPER_WIDTH) || 1028,
    BLOG_WALLPAPER_HEIGHT: Number(process.env.BLOG_WALLPAPER_HEIGHT) || 312,
    POST_ICON_WIDTH: Number(process.env.POST_ICON_WIDTH) || 940,
    POST_ICON_HEIGHT: Number(process.env.POST_ICON_HEIGHT) || 432,
    POST_ICON_MIDDLE_WIDTH: Number(process.env.POST_ICON_WIDTH) || 300,
    POST_ICON_MIDDLE_HEIGHT: Number(process.env.POST_ICON_HEIGHT) || 180,
    POST_ICON_SMALL_WIDTH: Number(process.env.POST_ICON_WIDTH) || 149,
    POST_ICON_SMALL_HEIGHT: Number(process.env.POST_ICON_HEIGHT) || 96,
  },
  bot_tg: {
    BOT_TOKEN: process.env.BOT_TOKEN,
  },
});
export type ConfigType = ReturnType<typeof getConfiguration>;
