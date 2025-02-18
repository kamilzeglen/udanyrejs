import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../role/role.entity';
import { Log } from '@modules/log/log.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 40 })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ default: false })
  isActive: boolean;

  @ManyToOne(() => Role, (role) => role.users, {
    eager: false,
    nullable: false,
  })
  role: Role;
  @Column({ type: 'uuid', nullable: false })
  roleId: string;

  @OneToMany(() => Log, (log) => log.createdBy)
  logs: Log[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
