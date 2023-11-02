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
export class UsersPasswordRecovery {
  @OneToOne(() => Users, (u) => u.userPasswordRecovery)
  @JoinColumn()
  user: Users;
  @PrimaryColumn()
  userId: string;

  @Column()
  @Generated('uuid')
  confirmationCode: string;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  expirationDate: Date;
}
