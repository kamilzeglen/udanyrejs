import { MigrationInterface, QueryRunner } from 'typeorm';

interface ShipIdCorrection {
  name: string;
  id: string;
  currency?: string;
}

export const SHIP_ID_CORRECTIONS: ShipIdCorrection[] = [
  { name: 'MSC Orchestra', id: '6615427b-47e0-498b-888b-9792f821458e' },
  { name: 'AIDAbella', id: '63ac52cb-3fc5-4f75-a96e-a8e193f76b21' },
  { name: 'AIDAblu', id: 'be24ec25-2e1a-46ae-8b22-1ea1fd05574a' },
  { name: 'AIDAcosma', id: 'e66af4c1-8211-4129-82f3-ce5ed95255f0' },
  { name: 'AIDAdiva', id: 'd3c2ccd9-5f34-45c6-ad26-a3b5a91f5840' },
  { name: 'AIDAluna', id: 'e3bc6c73-7809-41a8-b698-3ce1d2f0547d' },
  { name: 'AIDAmar', id: 'c7a2af73-f803-40df-8da9-e575842fbec6' },
  { name: 'AIDAnova', id: '020b4746-724a-49fa-ae48-b7a1735e4085' },
  { name: 'AIDAperla', id: '05bd9281-5cf8-4d29-8b1e-845bd207162c' },
  { name: 'AIDAprima', id: '98868382-fe51-4506-a944-3cb9795fe6fc' },
  { name: 'AIDAsol', id: 'cbe42a97-45c9-44c9-bd55-31649abebad9' },
  { name: 'AIDAstella', id: 'c37cb572-112d-4990-93e7-8a5e4fda93dc' },
  {
    name: 'Adventure of the Seas',
    id: '980ede63-425d-4175-a705-b58f8b7d732f',
    currency: 'USD',
  },
  {
    name: 'Allure of the Seas',
    id: '7a946b1b-a961-42ad-8565-15d33b51684b',
    currency: 'USD',
  },
  { name: 'Anthem of the Seas', id: '40bc1ad6-d8d8-4638-94c8-6964073adc78' },
  {
    name: 'Brilliance of the Seas',
    id: '89765bcd-59e4-400e-868d-11a748bad612',
    currency: 'USD',
  },
  { name: 'Costa Deliziosa', id: '54348005-7c12-4674-8208-85357f85b5c7' },
  { name: 'Costa Diadema', id: 'a58d918f-2213-4738-8eff-4521cca02f34' },
  { name: 'Costa Fascinosa', id: 'f1b2ad78-2321-4e0c-93e9-7cea14975397' },
  { name: 'Costa Favolosa', id: '6259207a-5d7e-49df-a66f-2edffb24ad96' },
  { name: 'Costa Fortuna', id: 'e927d001-ada6-44bc-a149-c16faf612f66' },
  { name: 'Costa Pacifica', id: '03562e97-c275-4f9a-8bc0-a62599731e14' },
  { name: 'Costa Serena', id: '601b27d3-5f59-45a4-9520-04190e8716f8' },
  { name: 'Costa Smeralda', id: 'ecf894ce-7610-4d12-8342-c8db26037ffc' },
  { name: 'Costa Toscana', id: '8f0a4f07-c6b8-4729-9cb6-bf4ddfb1d70a' },
  {
    name: 'Enchantment of the Seas',
    id: 'b93863a1-c087-49ab-a4fb-a4ad713baad4',
    currency: 'USD',
  },
  {
    name: 'Explorer of the Seas',
    id: 'df92a8e1-79c1-4030-a4e9-1eba838d90d1',
    currency: 'USD',
  },
  {
    name: 'Freedom of the Seas',
    id: '78235d96-edbd-4469-b52c-85af71b55d2b',
    currency: 'USD',
  },
  {
    name: 'Grandeur of the Seas',
    id: 'e95f6be3-4308-45ac-9ec3-ce274555114e',
    currency: 'USD',
  },
  {
    name: 'Harmony of the Seas',
    id: '24a89701-c561-4b15-9e17-5cc5ba3016fa',
    currency: 'USD',
  },
  { name: 'Icon of the Seas', id: '4785cbb9-7b37-4a2a-b9ee-6857cec71caf' },
  {
    name: 'Independence of the Seas',
    id: 'e6335037-5fef-433b-be02-2e99f357a359',
    currency: 'USD',
  },
  {
    name: 'Jewel of the Seas',
    id: '18b5def5-1405-4ac2-be64-824ac187b6e3',
    currency: 'USD',
  },
  {
    name: 'Liberty of the Seas',
    id: '193ee63b-8aba-4853-a65e-93ceb489726e',
    currency: 'USD',
  },
  {
    name: 'MEIN SCHIFF 1',
    id: '6688ef45-d691-4d9f-8579-7e976e165bca',
    currency: 'EUR',
  },
  {
    name: 'MEIN SCHIFF 5',
    id: 'e74bd85b-97b1-4fa6-83c1-57bb8d4a65f5',
    currency: 'EUR',
  },
  {
    name: 'MEIN SCHIFF 6',
    id: '99957ec3-ab4b-48dc-b50d-b6e8f6b2b9b9',
    currency: 'EUR',
  },
  { name: 'MSC Armonia', id: '9a501e62-9758-4b93-95d0-d15b292fb48d' },
  { name: 'MSC Bellissima', id: 'ffb5f89c-de70-47d7-a1ec-a29b0d88020a' },
  { name: 'MSC Divina', id: 'e9eaea0c-1f50-45af-bec8-58deadbdecdd' },
  { name: 'MSC Euribia', id: '0891ea5b-22da-4b06-a36a-c782e36b5d10' },
  { name: 'MSC Fantasia', id: 'af3eeb85-b417-4d70-83aa-93c0a6175ad6' },
  { name: 'MSC Grandiosa', id: '1baa3474-287f-4ae2-83e8-f3fa7db1d327' },
  { name: 'MSC Lirica', id: 'a3823fb3-26d1-4ce8-a4a9-4d36aa17915e' },
  { name: 'MSC Magnifica', id: 'a80d0f44-36c8-4dad-9e8d-1deb04671b49' },
  { name: 'MSC Meraviglia', id: '9ed99641-5744-45a7-b8d4-dc99f6928bc0' },
  { name: 'MSC Musica', id: 'a79a1c38-ddff-4f0b-91b9-26acf88728a1' },
  { name: 'MSC Opera', id: '4d6f3382-9791-4ee5-bc93-4e3b11cf0a6c' },
  { name: 'MSC Poesia', id: 'd9d96c3c-0c37-4428-ba5d-6dd6d3e960ba' },
  { name: 'MSC Preziosa', id: '338b14e2-42c7-4b93-9d54-a95354c910e6' },
  { name: 'MSC Seascape', id: 'feb5ac59-e2b4-44f9-8064-6954a0b651ac' },
  { name: 'MSC Seashore', id: 'ee3a7983-0ee0-4541-8c8e-e9f1072063b3' },
  { name: 'MSC Seaside', id: 'a90db6e3-34d9-4d32-9ed4-65406072d136' },
  { name: 'MSC Seaview', id: '9454663b-9730-4484-a50e-dd16757bcd6d' },
  { name: 'MSC Sinfonia', id: 'ed939fcd-20c8-4a88-b22a-ef9c9f0eca87' },
  { name: 'MSC Splendida', id: 'b43d2f4c-850a-4d0b-a4ed-45dcd8dcdb61' },
  { name: 'MSC Virtuosa', id: 'c36a8895-94db-4bc2-bef2-e641a22fdb9b' },
  {
    name: 'MSC World America',
    id: '997ee4e3-549f-4a1d-b7a8-31d58d1e049c',
    currency: 'USD',
  },
  { name: 'MSC World Europa', id: 'b20505a1-8c14-4d83-a634-c16ea9166a98' },
  {
    name: 'Mariner of the Seas',
    id: '2a643fb8-bd19-4d6a-9a1f-843652cba123',
    currency: 'USD',
  },
  {
    name: 'Navigator of the Seas',
    id: '223bea38-d0d8-4423-ac8a-281da10a8da6',
    currency: 'USD',
  },
  { name: 'Norwegian Aqua', id: 'a19a86c8-cf86-446b-9f92-0e862b8094d2' },
  { name: 'Norwegian Bliss', id: '4c3fe7b2-c5ed-4f75-9e5c-7ba879ea03a9' },
  { name: 'Norwegian Breakaway', id: '4c1b967a-2918-4d8c-b400-bac38e93a59b' },
  { name: 'Norwegian Dawn', id: 'b2c375bb-7bbb-4cc6-9d48-0e5180fa6943' },
  { name: 'Norwegian Encore', id: 'e64f9f12-ebb1-4920-832a-04737977bd34' },
  { name: 'Norwegian Epic', id: '3ddc5614-bf10-4311-be08-68f3f143a568' },
  { name: 'Norwegian Escape', id: '7e93c20f-c025-4811-8272-1e7f1afa9ce1' },
  { name: 'Norwegian Getaway', id: '714ce543-8b2f-48e3-bdb8-87bae5037377' },
  { name: 'Norwegian Gem', id: '99d8dcb0-e9c0-43d5-9e6e-b3b45f2a7f97' },
  { name: 'Norwegian Jade', id: 'f3053a89-246d-4758-be49-4c1ffc48d400' },
  { name: 'Norwegian Jewel', id: '8587cb8e-1c7a-40ac-90ac-6bae8d69b8fe' },
  { name: 'Norwegian Joy', id: '523bb141-017a-42b5-bacf-30544b07fca2' },
  {
    name: 'Norwegian Luna',
    id: '68b5e9ad-2aa0-412d-a4a9-703ca2245b58',
    currency: 'USD',
  },
  { name: 'Norwegian Pearl', id: 'a9b35a83-0308-46a6-a22e-1375d53ffd3e' },
  { name: 'Norwegian Prima', id: '8ff1a25d-b4a7-46a1-8f0b-46f76c01adee' },
  { name: 'Norwegian Sky', id: '2be72f72-2442-4995-8333-cce161fd106a' },
  { name: 'Norwegian Spirit', id: 'b20df8fb-ec73-4b48-8025-50a295576f12' },
  { name: 'Norwegian Star', id: '1c6d094a-9fa9-4e0d-af77-b2e635554662' },
  { name: 'Norwegian Sun', id: 'fc01c757-6a3b-48c1-b4fd-0ffd363e6150' },
  { name: 'Norwegian Viva', id: '49f3df87-544f-455b-a0a2-be558df156e4' },
  {
    name: 'Oasis of the Seas',
    id: '636a2464-3b1a-44e7-8c2b-7160d79ca448',
    currency: 'USD',
  },
  { name: 'Odyssey of the Seas', id: '90925271-f705-4f2f-8461-f4ff1a1698a1' },
  { name: 'Ovation of the Seas', id: 'b4d21647-4837-4638-a9e8-4dea63f67e0e' },
  { name: 'Pride Of America', id: '7d7e445a-afa1-49f5-a4cc-6bfa776fc815' },
  {
    name: 'Quantum of the Seas',
    id: '396d020b-ceff-44e1-b329-671279100c1d',
    currency: 'USD',
  },
  {
    name: 'Radiance of the Seas',
    id: '9755a6c9-ec08-4e05-92c0-da92072c380b',
    currency: 'USD',
  },
  {
    name: 'Rhapsody of the Seas',
    id: 'f9eb1b88-9b4c-4e95-afe2-2d1d4a6be4dd',
    currency: 'USD',
  },
  {
    name: 'Serenade of the Seas',
    id: '9bf8fee1-7288-4605-b780-2d79254fb513',
    currency: 'USD',
  },
  {
    name: 'Spectrum of the Seas',
    id: 'd550781c-2fec-45d5-9620-e9916f477a29',
    currency: 'USD',
  },
  {
    name: 'Symphony of the Seas',
    id: 'd14c9d71-de5d-4226-bda3-c7f2157c1100',
    currency: 'USD',
  },
  {
    name: 'Vision of the Seas',
    id: '3a783a75-2deb-48fa-88b3-33c569b522a7',
    currency: 'USD',
  },
  {
    name: 'Voyager of the Seas',
    id: '1a0c6900-8736-4c4c-917a-57207fbbb112',
    currency: 'USD',
  },
  {
    name: 'Wonder of the Seas',
    id: '15e29fbe-6a5f-45db-aa32-b31e0ddd1832',
    currency: 'USD',
  },
  { name: 'Star of the Seas', id: '4ecaee21-021a-41e4-98de-90f17652b78c' },
  { name: 'Legend of the Seas', id: '0a1a330b-79c0-46ff-a651-2f6298ddac46' },
  { name: 'Utopia of the Seas', id: 'f5a821a4-d6c0-4f03-ae65-bb50cf5ae4a4' },
];

export class FixShipIdsAndCurrency1789400000000 implements MigrationInterface {
  public readonly name = 'FixShipIdsAndCurrency1789400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const correction of SHIP_ID_CORRECTIONS) {
      await queryRunner.query(
        `UPDATE "ship"
         SET "id" = $2::uuid,
             "currency" = CASE WHEN "currency" IS NULL AND $3::varchar IS NOT NULL THEN $3::varchar ELSE "currency" END
         WHERE "name" = $1`,
        [correction.name, correction.id, correction.currency ?? null],
      );
    }
  }

  public async down(): Promise<void> {}
}
