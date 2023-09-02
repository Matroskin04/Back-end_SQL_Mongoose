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
export class UserPasswordRecovery {
  @OneToOne(() => User, (u) => u.userPasswordRecovery)
  @JoinColumn()
  user: User;
  @PrimaryColumn()
  userId: string;

  @Column()
  @Generated('uuid')
  confirmationCode: string;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  expirationDate: Date;
}
