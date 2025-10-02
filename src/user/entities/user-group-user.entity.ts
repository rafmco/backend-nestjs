import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from './user.entity';
import { UserGroup } from './user-group.entity';

@Entity('user_group_user')
export class UserGroupUser {
  @PrimaryColumn('char', { length: 36 })
  id: string;

  @Column('char', { length: 36 })
  userGroupId: string;

  @Column('char', { length: 36 })
  userId: string;

  @Column('timestamp')
  createdAt: Date;

  @Column('timestamp', { nullable: true })
  deletedAt: Date;

  @ManyToOne(() => User, (user) => user.userGroupUsers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => UserGroup, (userGroup) => userGroup.userGroupUsers)
  @JoinColumn({ name: 'userGroupId' })
  userGroup: UserGroup;
}
