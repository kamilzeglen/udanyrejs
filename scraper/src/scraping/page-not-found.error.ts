export class PageNotFoundError extends Error {
  constructor(public readonly url: string) {
    super(`Page not found: ${url}`);
    this.name = 'PageNotFoundError';
  }
}
