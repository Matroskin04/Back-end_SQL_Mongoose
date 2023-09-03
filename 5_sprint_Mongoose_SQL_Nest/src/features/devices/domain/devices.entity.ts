import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../users/domain/users.entity';

@Entity()
export class Devices {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  ip: string;

  @Column({ nullable: true })
  title: string;

  @Column()
  expirationDate: Date;

  @Column()
  lastActiveDate: string;

  @ManyToOne(() => Users, (u) => u.device)
  @JoinColumn()
  user: Users;
  @Column()
  userId: string;
}
