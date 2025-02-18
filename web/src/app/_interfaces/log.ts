import {User} from './user';

export interface Log {
  id: string;
  message: string;
  createdBy: User,
  createdById: string
  createdAt: Date | string;
}
