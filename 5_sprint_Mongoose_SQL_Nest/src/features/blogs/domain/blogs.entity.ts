import { BlogDTOType, BlogDocument, BlogModelType } from './blogs.db.types';
import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { BlogViewType } from '../public-blogs/infrastructure/query.repository/blogs-public.types.query.repository';
import { BlogSAOutputType } from '../super-admin-blogs/infrastructure/query.repository/blogs-sa.types.query.repository';

@Schema()
export class Blog {
  _id: ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop({ required: true, default: new Date().toISOString() })
  createdAt: string;

  @Prop({ type: Boolean, required: true, default: false })
  isMembership: boolean;

  @Prop({ type: Object, required: true })
  blogOwnerInfo: {
    userId: string;
    userLogin: string;
  };

  @Prop({ type: Boolean, default: false })
  isBanned: boolean; //todo плохая реализация? При поиске постов запрашиваю все айди забаненных блогов и сравниваю

  @Prop({ type: String || null, default: new Date().toISOString() })
  banDate: string | null;

  static createInstance(
    blogDTO: BlogDTOType,
    BlogModel: BlogModelType,
  ): BlogDocument {
    return new BlogModel(blogDTO);
  }

  modifyIntoViewGeneralModel(): BlogViewType {
    return {
      id: this._id,
      name: this.name,
      description: this.description,
      websiteUrl: this.websiteUrl,
      createdAt: this.createdAt,
      isMembership: this.isMembership,
    };
  }

  modifyIntoViewSAModel(): BlogSAOutputType {
    return {
      id: this._id,
      name: this.name,
      description: this.description,
      websiteUrl: this.websiteUrl,
      createdAt: this.createdAt,
      isMembership: this.isMembership,
      blogOwnerInfo: {
        userId: this.blogOwnerInfo.userId,
        userLogin: this.blogOwnerInfo.userLogin,
      },
      banInfo: {
        isBanned: this.isBanned,
        banDate: this.isBanned ? this.banDate : null,
      },
    };
  }

  updateBlogInfo(blog: BlogDocument, updateData: BlogDTOType): void {
    blog.name = updateData.name;
    blog.description = updateData.description;
    blog.websiteUrl = updateData.websiteUrl;
    return;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.statics = {
  createInstance: Blog.createInstance,
};

BlogSchema.methods = {
  modifyIntoViewGeneralModel: Blog.prototype.modifyIntoViewGeneralModel,
  modifyIntoViewSAModel: Blog.prototype.modifyIntoViewSAModel,
  updateBlogInfo: Blog.prototype.updateBlogInfo,
};
