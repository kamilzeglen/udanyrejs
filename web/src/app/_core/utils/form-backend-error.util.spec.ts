import { FormControl, Validators } from '@angular/forms';
import { clearBackendError, setBackendErrorForKey } from './form-backend-error.util';

describe('form backend errors', () => {
  it('adds a backend error for the matching API key without removing validator errors', () => {
    const control = new FormControl('', Validators.required);

    const matched = setBackendErrorForKey(
      control,
      { error: { key: 'CATEGORY_NAME_DUPLICATE' } },
      'CATEGORY_NAME_DUPLICATE',
    );

    expect(matched).toBe(true);
    expect(control.errors).toEqual({ required: true, backend: true });
  });

  it('ignores unrelated API errors', () => {
    const control = new FormControl('Name');

    const matched = setBackendErrorForKey(control, { error: { key: 'OTHER_ERROR' } }, 'SHIP_NAME_DUPLICATE');

    expect(matched).toBe(false);
    expect(control.errors).toBeNull();
  });

  it('clears only the backend error before another submit', () => {
    const control = new FormControl('');
    control.setErrors({ required: true, backend: true });

    clearBackendError(control);

    expect(control.errors).toEqual({ required: true });
  });
});
