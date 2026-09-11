import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  APP_ENV: Joi.string().required(),
  APP_PORT: Joi.number().required(),
  WEB_URL: Joi.string().uri().required(),

  // Nieużywana obecnie w kodzie (żaden serwis jej nie czyta) - opcjonalna,
  // żeby nie wymagać od produkcji ustawiania zmiennej pod martwą funkcję.
  DAYS_BEFORE_INACTIVE: Joi.number().default(7),

  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRATION_SECONDS: Joi.number().required(),
  REFRESH_TOKEN_EXPIRATION_DAYS: Joi.number().default(30),

  HTTPS_ENABLED: Joi.string().valid('ENABLED', 'DISABLED').required(),
  DOMAINS_WHITELIST: Joi.string().required(),

  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().required(),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DB_SYNC: Joi.string().valid('true', 'false').required(),

  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.number().required(),
  MAIL_USER: Joi.string().required(),
  MAIL_PASSWORD: Joi.string().required(),
  MAIL_SECURE: Joi.string().valid('true', 'false').required(),

  OFFERS_IMAGES_PATH: Joi.string().required(),
  SHIPS_IMAGES_PATH: Joi.string().required(),
  COMPANIES_IMAGES_PATH: Joi.string().required(),
  OFFERS_PDFS_PATH: Joi.string().required(),

  SCRAPER_URL: Joi.string().uri().required(),
  SCRAPER_INTERNAL_TOKEN: Joi.string().min(16).required(),
  ALLOWED_SCRAPE_HOSTS: Joi.string().required(),
  SYNC_CRON_EXPRESSION: Joi.string().default('0 4 * * *'),
  SYNC_REQUEST_DELAY_MS: Joi.number().default(3000),
}).unknown(true);
