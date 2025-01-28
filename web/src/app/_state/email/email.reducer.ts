import {initialState, EmailState} from './email.state';
import {Action, createReducer, on} from '@ngrx/store';
import * as emailActions from '@state/email/email.actions';


const reducer = createReducer(
  initialState,

  on(emailActions.sendEmail, state => ({
    ...state,
    sending: true,
    errorMessage: null,
    emailSent: false,
  })),
  on(emailActions.sendEmailSuccess, (state) => ({
    ...state,
    sending: false,
    errorMessage: null,
    emailSent: true
  })),
  on(emailActions.sendEmailError, (state, {errorMessage}) => ({
    ...state,
    sending: false,
    errorMessage,
    emailSent: null,
  })),
)

export function emailReducer(state: EmailState | undefined, action: Action): EmailState {
  return reducer(state, action);
}
