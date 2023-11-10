import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Users } from '../../../features/users/domain/users.entity';

@Entity()
export class SubscribersOfTgBot {
  @Column({ nullable: true })
  telegramId: string;

  @Column()
  codeConfirmation: string;

  @ManyToOne(() => Users, (u) => u.subscribersOfTgBot)
  @JoinColumn()
  user: Users;
  @PrimaryColumn()
  userId: string;
}
