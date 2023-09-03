import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { Users } from './users.entity';

@Entity()
export class UsersBanInfo {
  @Column({ default: false })
  isBanned: boolean;

  @Column()
  banReason: string;

  @CreateDateColumn()
  banDate: Date;

  @OneToOne(() => Users, (u) => u.userBanInfo)
  @JoinColumn()
  user: Users;
  @PrimaryColumn()
  userId: string;
}
