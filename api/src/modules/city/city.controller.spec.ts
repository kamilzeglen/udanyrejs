import { CityController } from './city.controller';

describe('CityController', () => {
  it('adds the generation timestamp to the exported CSV filename', async () => {
    const cityService = {} as any;
    const cityImportExportService = {
      exportToCsv: jest.fn().mockResolvedValue('name\nGdynia'),
    } as any;
    const controller = new CityController(cityService, cityImportExportService);
    const response = {
      send: jest.fn(),
      setHeader: jest.fn(),
    } as any;

    await controller.exportCities(undefined, response);

    expect(response.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      expect.stringMatching(
        /^attachment; filename="cities-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.csv"$/,
      ),
    );
  });
});
