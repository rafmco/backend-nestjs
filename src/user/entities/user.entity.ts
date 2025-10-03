import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { UserGroupUser } from './user-group-user.entity';
import { v4 as uuid } from 'uuid';

@Entity()
export class User {
  @PrimaryColumn('char', { length: 36 })
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 255 })
  salt: string;

  @Column('tinyint')
  active: number;

  @Column({ length: 255, nullable: true })
  avatarUrl: string;

  @Column('timestamp')
  createdAt: Date;

  @Column('timestamp', { nullable: true })
  deletedAt: Date;

  // Relacionar groups com users via UserGroupUser
  @OneToMany(() => UserGroupUser, (userGroupUser) => userGroupUser.user)
  userGroupUsers: UserGroupUser[];

  @BeforeInsert()
  generateId() {
    this.id = uuid();
  }
}
