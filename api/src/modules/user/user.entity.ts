import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn} from "typeorm";
import {Role} from "../role/role.entity";

@Entity()
export class User {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'varchar', length: 40})
  email: string;

  @Column({type: 'varchar'})
  password: string;

  @Column({default: false})
  isActive: boolean;

  @ManyToOne(() => Role, (role) => role.users, { eager: false, nullable: false })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
