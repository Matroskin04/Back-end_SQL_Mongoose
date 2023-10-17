export const getConfiguration = () => ({
  ENV: process.env.ENV,
});

export type ConfigType = ReturnType<typeof getConfiguration>;
