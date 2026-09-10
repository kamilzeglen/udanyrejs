import { User } from '@interfaces';

export type UsersState = Readonly<{
  users: User[];
  loading: boolean;
  errorMessage: string;
}>;

export const initialState: UsersState = {
  users: null,
  loading: false,
  errorMessage: null,
};
