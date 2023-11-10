import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../../features/users/domain/users.entity';

@Entity()
export class SubscribersOfTgBot {
  @PrimaryGeneratedColumn()
  telegramId: string;

  @ManyToOne(() => Users, (u) => u.subscribersOfTgBot)
  @JoinColumn()
  user: Users;
  @Column()
  userId: string;
}
