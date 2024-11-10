import {Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {Roles} from "../../interfaces/roles";

@Entity()
export class User {

  @PrimaryGeneratedColumn()
  id: string;

  @Column({type: 'varchar', length: 30})
  name: string;

  @Column({type: 'varchar', length: 40})
  email: string;

  @Column({type: 'varchar'})
  password: string;

  @Column({type: 'enum', enum: Roles})
  role: Roles;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
