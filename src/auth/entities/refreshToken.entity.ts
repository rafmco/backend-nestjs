import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class RefreshToken {
  @PrimaryColumn('char', { length: 36 })
  id: string;

  @Column('text')
  value: string;

  @Column('char', { length: 36 })
  userId: string;

  @Column('timestamp')
  createdAt: Date;

  @Column('timestamp', { nullable: true })
  deletedAt: Date;
}
