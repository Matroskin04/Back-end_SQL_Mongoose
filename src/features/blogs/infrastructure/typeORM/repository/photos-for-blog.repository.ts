import { Injectable } from '@nestjs/common';

@Injectable()
export class PhotosForBlogRepository {
  constructor() {}

  async saveBlogIconInfo(photoInfo): Promise<void> {}
}
