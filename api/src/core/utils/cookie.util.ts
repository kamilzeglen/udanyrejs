import { Request } from 'express';

// cookie-parser nie jest tu zarejestrowany jako middleware, więc ciasteczka
// czytamy ręcznie z nagłówka - spójnie z tym, jak robi to AuthGuard.
export function extractCookie(
  request: Request,
  name: string,
): string | undefined {
  const cookies = request.headers.cookie;
  if (!cookies) {
    return undefined;
  }

  const pair = cookies
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));
  return pair ? pair.split('=')[1] : undefined;
}
