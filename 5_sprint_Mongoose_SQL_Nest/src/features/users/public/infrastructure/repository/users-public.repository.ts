import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { UserInstanceType } from '../../../super-admin/infrastructure/repository/users-sa.types.repositories';
import { User } from '../../../domain/users.entity';
import { UserModelType } from '../../../domain/users.db.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable() //todo для чего этот декоратор
export class UsersPublicRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  //SQL
  async createUser(
    userId: string,
    login: string,
    email: string,
    passwordHash: string,
  ): Promise<void> {
    await this.dataSource.query(
      `
    INSERT INTO public.users( 
        "id", "login", "email", "passwordHash") 
        VALUES ($1, $2, $3, $4);
`,
      [userId, login, email, passwordHash],
    );
    return;
  }

  //MONGO
  async updatePassword(
    newPasswordHash: string,
    _id: ObjectId,
  ): Promise<boolean> {
    const result = await this.UserModel.updateOne(
      { _id },
      { $set: { passwordHash: newPasswordHash } },
    );
    return result.modifiedCount === 1;
  }

  async save(user: UserInstanceType): Promise<void> {
    await user.save();
    return;
  }
}
