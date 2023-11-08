import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../../../configuration/configuration';

export function modifyBlogIntoViewSAModel(blog) {
  return {
    id: blog.id,
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt.toISOString(),
    isMembership: blog.isMembership,
    blogOwnerInfo: {
      userId: blog.userId,
      userLogin: blog.userLogin,
    },
    banInfo: {
      isBanned: blog.isBanned,
      banDate: blog.banDate,
    },
  };
}

export function modifyBlogIntoViewGeneralModel(
  blog,
  configService: ConfigService<ConfigType>,
) {
  return {
    id: blog.id,
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt.toISOString(),
    isMembership: blog.isMembership,
    images: {
      wallpaper: blog.wallpaper
        ? {
            ...blog.wallpaper,
            url:
              configService.get('S3', { infer: true })!.URL +
              blog.wallpaper.url,
          }
        : null,
      main:
        blog.icons?.map((icon) => ({
          ...icon,
          url: configService.get('S3', { infer: true })!.URL + icon.url,
        })) ?? [],
    },
  };
}
