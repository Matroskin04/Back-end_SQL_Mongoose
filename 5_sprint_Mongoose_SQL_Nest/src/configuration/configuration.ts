import process from 'process';

export const getConfiguration = () => ({
  db: {
    mongo: {
      MONGO_URL: process.env.MONGO_URL ?? 'mongodb://0.0.0.0:27017',
    },
    postgresql: {
      POSTGRES_URL: process.env.POSTGRES_URL,
      POSTGRES_USER: process.env.POSTGRES_USER,
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
      POSTGRES_HOST: process.env.POSTGRES_HOST,
      POSTGRES_PORT: process.env.POSTGRES_PORT,
      POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,
    },
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
});
export type ConfigType = ReturnType<typeof getConfiguration>;
