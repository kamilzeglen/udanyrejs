import { HttpException } from '@nestjs/common';
import { ApiErrorDefinition } from './api-errors';

// Wyjątek domenowy ze stabilnym kluczem błędu. Frontend tłumaczy `key`
// (+ opcjonalne `params`) na komunikat - nie polega na treści `message`,
// która jest tylko fallbackiem dla logów/dokumentacji API.
export class AppException extends HttpException {
  public readonly key: string;

  constructor(error: ApiErrorDefinition, params?: Record<string, unknown>) {
    super({ key: error.key, message: error.message, params }, error.status);
    this.key = error.key;
  }
}
