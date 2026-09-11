export type DiscoverState = Readonly<{
  starting: boolean;
  errorMessage: string;
}>;

export const initialState: DiscoverState = {
  starting: false,
  errorMessage: null,
};
