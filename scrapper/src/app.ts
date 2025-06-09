import express, {Express, NextFunction, Request, Response} from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from "dotenv";
import {handleFullScrapeRequest, handlePriceScrapeRequest} from './controllers/scraper.controller';
import asyncHandler from 'express-async-handler';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4006;

const allowedOrigins = [
  process.env.WEB_URL || 'http://localhost:4200',
  process.env.API_URL || 'http://localhost:3000',
];

app.use((req: Request, res: Response, next: NextFunction) => {
  next();
});

app.use(bodyParser.json());
app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.post(
  "/full-scrap",
  asyncHandler(async (req: Request, res: Response) => {
    await handleFullScrapeRequest(req, res);
  })
);

app.post(
  "/price-scrap",
  asyncHandler(async (req: Request, res: Response) => {
    await handlePriceScrapeRequest(req, res);
  })
);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
})
