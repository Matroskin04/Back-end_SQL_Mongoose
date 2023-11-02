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
export class UsersEmailConfirmation {
  @OneToOne(() => Users, (u) => u.userEmailConfirmation)
  @JoinColumn()
  user: Users;
  @PrimaryColumn()
  userId: string;

  @Column()
  @Generated('uuid')
  confirmationCode: string;

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  expirationDate: Date;

  @Column()
  isConfirmed: boolean;
}
