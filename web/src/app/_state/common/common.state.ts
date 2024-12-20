import {Company} from '@interfaces';


export type CommonState = Readonly<{
  companies: Company[];

  loading: boolean;
  errorMessage: string;

}>;

export const initialState: CommonState = {
  companies: null,

  loading: false,
  errorMessage: null,
};
