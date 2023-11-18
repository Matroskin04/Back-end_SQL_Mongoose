import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Users } from '../../users/domain/users.entity';

@Entity()
export class SubscribersOfTgBot {
  @Column({ nullable: true, type: 'bigint' })
  telegramId: number;

  @Column('uuid')
  codeConfirmation: string;

  @ManyToOne(() => Users, (u) => u.subscribersOfTgBot)
  @JoinColumn()
  user: Users;
  @PrimaryColumn('uuid')
  userId: string;
}
