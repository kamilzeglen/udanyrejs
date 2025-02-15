import { Request, Response } from 'express';
import {scrapeFullCruiseData} from "../services/fullScraper.service";
import {scrapeCruisePrice} from "../services/priceScraper.service";

export const handleFullScrapeRequest = async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const result = await scrapeFullCruiseData(url);
    res.json({ url, ...result });
  } catch (error) {
    const status = (error instanceof Error && error.message.includes('Strona rejsu'))
      ? 404
      : 500;

    const errorMessage = error instanceof Error
      ? error.message
      : 'Unknown error occurred';

    console.log(error)
    res.status(status).json({ error: errorMessage });
  }
};

export const handlePriceScrapeRequest = async (req: Request, res: Response) => {
  const { id, url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }

  try {
    const result = await scrapeCruisePrice(url);

    if (!result.exists) {
      return res.json({ exists: false, message: 'Oferta nie istnieje' });
    }

    res.json({ id: id, exists: true, price: result.price });
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
};
