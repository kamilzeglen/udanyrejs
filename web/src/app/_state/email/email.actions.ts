import { createAction, props } from '@ngrx/store';
import { Email } from '../../_interfaces/email';

export const sendEmail = createAction('[Email] Send Email', props<{ payload: Email }>());
export const sendEmailSuccess = createAction('[Email] Send Email Success', props<{ emailSent: boolean }>());
export const sendEmailError = createAction('[Email] Send Email Error', props<{ errorMessage: string }>());
