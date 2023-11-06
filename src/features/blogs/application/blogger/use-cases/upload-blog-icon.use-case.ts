import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../../../../../infrastructure/adapters/s3-storage.adapter';

export class UploadBlogIconCommand {
  constructor(public photo: Express.Multer.File, public blogId: string) {}
}

@CommandHandler(UploadBlogIconCommand)
export class UploadBlogIconUseCase
  implements ICommandHandler<UploadBlogIconCommand>
{
  constructor(protected s3StorageAdapter: S3StorageAdapter) {}
  async execute(command: UploadBlogIconCommand): Promise<void> {
    const { photo, blogId } = command;

    const fileUrl = await this.s3StorageAdapter.saveIconForBlog(blogId, photo);
  }
}
