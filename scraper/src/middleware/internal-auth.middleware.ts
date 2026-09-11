import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ScraperConfig } from '../config';

export function createInternalAuthMiddleware(config: ScraperConfig): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const providedToken = req.header('X-Internal-Token');
    const tokenIsValid = providedToken === config.internalToken;

    if (!tokenIsValid) {
      console.warn(`[scraper] rejected ${req.method} ${req.path}: invalid or missing internal token`);
      res.status(401).json({ message: 'Invalid or missing internal token' });
      return;
    }

    next();
  };
}
