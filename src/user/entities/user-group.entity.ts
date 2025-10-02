import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { UserGroupUser } from './user-group-user.entity';

@Entity()
export class UserGroup {
  @PrimaryColumn('char', { length: 36 })
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  organizationId: string;

  @Column('timestamp')
  createdAt: Date;

  @Column('timestamp', { nullable: true })
  deletedAt: Date;

  // Relacionar groups com users via UserGroupUser
  @OneToMany(() => UserGroupUser, (userGroupUser) => userGroupUser.userGroup)
  userGroupUsers: UserGroupUser[];
}
