export type CreateCorrectUserTestType = {
  login: string;
  password: string;
  email: string;
};

export type LoginCorrectUserTestType = {
  accessToken: string;
  refreshToken: string;
};

export type CreateCorrectBlogTestType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
};

export type CreateCorrectPostTestType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
};
