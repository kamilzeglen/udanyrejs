export type ScrapperState = Readonly<{
  scrappedData: any;
  loading: boolean,
  errorMessage: string,
}>;

export const initialState: ScrapperState = {
  scrappedData: null,
  loading: false,
  errorMessage: null,
};
