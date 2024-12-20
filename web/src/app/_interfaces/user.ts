import {Roles} from './roles';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Roles;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
