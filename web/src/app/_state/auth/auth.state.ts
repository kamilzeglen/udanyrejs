import { User } from '@interfaces';

export type AuthState = Readonly<{
  loading: boolean;
  myself: null | User;
  errorMessage: string | null;
}>;

export const initialState: AuthState = {
  loading: false,
  myself: null,
  errorMessage: null,
};
