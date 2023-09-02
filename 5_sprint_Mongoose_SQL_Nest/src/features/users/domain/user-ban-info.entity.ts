import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserBanInfo {
  @Column({ default: false })
  isBanned: boolean;

  @Column()
  banReason: string;

  @CreateDateColumn()
  banDate: Date;

  @OneToOne(() => User, (u) => u.userBanInfo)
  @JoinColumn()
  user: User;
  @PrimaryColumn()
  userId: string;
}
