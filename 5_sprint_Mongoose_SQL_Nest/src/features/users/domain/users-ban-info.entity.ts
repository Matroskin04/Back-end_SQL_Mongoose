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

  @Column({ nullable: true })
  banReason: string;

  @Column({ nullable: true })
  banDate: Date | null;

  @OneToOne(() => Users, (u) => u.userBanInfo)
  @JoinColumn()
  user: Users;
  @PrimaryColumn()
  userId: string;
}
