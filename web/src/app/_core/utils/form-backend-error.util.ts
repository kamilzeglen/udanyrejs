import { AbstractControl } from '@angular/forms';

export function setBackendErrorForKey(control: AbstractControl, error: unknown, expectedKey: string): boolean {
  if (getApiErrorKey(error) !== expectedKey) {
    return false;
  }

  control.setErrors({ ...control.errors, backend: true });
  return true;
}

export function clearBackendError(control: AbstractControl): void {
  const errors = control.errors;

  if (errors?.['backend'] !== true) {
    return;
  }

  const { backend: _backend, ...remainingErrors } = errors;
  control.setErrors(Object.keys(remainingErrors).length > 0 ? remainingErrors : null);
}

function getApiErrorKey(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (typeof error !== 'object' || error === null) {
    return '';
  }

  const typedError = error as { key?: string; error?: { key?: string } };
  return typedError.error?.key ?? typedError.key ?? '';
}
