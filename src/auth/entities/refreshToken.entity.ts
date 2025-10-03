import { Entity, Column, PrimaryColumn, BeforeInsert } from 'typeorm';
import { v4 as uuid } from 'uuid';
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

  @BeforeInsert()
  generateId() {
    this.id = uuid();
  }
}
