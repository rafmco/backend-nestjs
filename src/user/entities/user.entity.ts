import { Entity, Column, PrimaryColumn } from 'typeorm';

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
}
