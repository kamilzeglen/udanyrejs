export type EmailState = Readonly<{
  emailSent: boolean;
  sending: boolean;
  errorMessage: string;
}>;

export const initialState: EmailState = {
  emailSent: null,
  sending: false,
  errorMessage: null,
};
