import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReplaceCategoryData1789370000000 implements MigrationInterface {
  public readonly name = 'ReplaceCategoryData1789370000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "offer_term_categories"`);
    await queryRunner.query(`DELETE FROM "category"`);
    await queryRunner.query(`
      INSERT INTO "category" ("id", "name", "url", "position", "startDate", "endDate", "isActive", "isVisible", "createdById", "updatedById")
      VALUES
        ('504fdbe5-592b-46bd-83d9-62e9696a9018', 'Zima 2026', 'winter-2026', NULL, '2026-12-01', '2027-02-28', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('4e92b73c-aabc-4482-bfbe-ad2d644cd443', 'Majówka 2026', 'long-week-2026', NULL, '2026-04-27', '2026-05-03', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('de657945-1eed-465a-8890-aa4c5e63a956', 'Wakacje 2026', 'holidays-2026', NULL, '2026-06-27', '2026-08-31', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('ee497e39-a18c-4a93-abba-f7f77e5272f7', 'Jesień 2026', 'autumn-2026', NULL, '2026-09-01', '2026-11-30', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('986c1ce6-6efa-4a60-9001-01106722e0f2', 'Wiosna 2026', 'spring-2026', NULL, '2026-03-01', '2026-05-31', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('3ba1d9b9-2183-40b0-a051-013a619a9be0', 'Zima 2027', 'winter-2027', NULL, '2027-12-01', '2028-02-29', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('2ad8d1c1-a14b-4f94-ac02-fde3ab5fa27b', 'Wiosna 2027', 'spring-2027', NULL, '2027-03-01', '2027-05-31', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('e18dbc61-adbd-437b-8013-ca50e5e2a299', 'Majówka 2027', 'long-week-2027', NULL, '2027-04-27', '2027-05-03', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('73a74c50-2317-47f3-a53a-e5e33588dbe7', 'Wakacje 2027', 'holidays-2027', NULL, '2027-06-27', '2027-08-31', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('498775f7-1a64-4cb8-ac8d-6b65ec78a5ab', 'Jesień 2027', 'autumn-2027', NULL, '2027-09-01', '2027-11-30', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('b97b955a-aa79-4d27-b5bc-ff76eaf31b2c', 'Zima 2028', 'winter-2028', NULL, '2028-12-01', '2029-02-28', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('2c7dd45f-a5f3-4a60-94cc-f99d21cbd38f', 'Wiosna 2028', 'spring-2028', NULL, '2028-03-01', '2028-05-31', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('5fa8882b-fce1-4aa6-91cf-216b12493b01', 'Majówka 2028', 'long-week-2028', NULL, '2028-04-27', '2028-05-03', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('cb8cf3d9-5bc8-463e-a93f-34cb808f9ed0', 'Wakacje 2028', 'holidays-2028', NULL, '2028-06-27', '2028-08-31', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('bb71ed9a-053a-4bef-ac1a-77f1b42f3382', 'Jesień 2028', 'autumn-2028', NULL, '2028-09-01', '2028-11-30', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('9efac534-e3f7-4891-b7b5-c1e5b7083bfc', 'Zima 2029', 'winter-2029', NULL, '2029-12-01', '2030-02-28', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('8e97a033-fa06-4f40-ac7c-e8bd47ccf194', 'Wiosna 2029', 'spring-2029', NULL, '2029-03-01', '2029-05-31', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('62df0d2e-bf58-4026-8ce4-d0d6359a2ca4', 'Majówka 2029', 'long-week-2029', NULL, '2029-04-27', '2029-05-03', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('eef61d78-842b-47f9-89c8-9cd2fd0afff4', 'Wakacje 2029', 'holidays-2029', NULL, '2029-06-27', '2029-08-31', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('3e3bc57c-764b-4037-9616-85b1a13c9f67', 'Jesień 2029', 'autumn-2029', NULL, '2029-09-01', '2029-11-30', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('c42412f5-5b32-4c1e-99d7-1c5ceb1672c6', 'Zima 2030', 'winter-2030', NULL, '2030-12-01', '2031-02-28', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('d0d1fc29-9876-43ef-848f-cf485647d7b0', 'Wiosna 2030', 'spring-2030', NULL, '2030-03-01', '2030-05-31', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('d5627544-a31c-4cc3-b2b8-4a196d78f463', 'Majówka 2030', 'long-week-2030', NULL, '2030-04-27', '2030-05-03', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('f8ecc221-58cf-4f7c-8a1d-3f9e21f5e99e', 'Wakacje 2030', 'holidays-2030', NULL, '2030-06-27', '2030-08-31', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('913ade69-5b21-4360-9c5a-f8889531f4d5', 'Jesień 2030', 'autumn-2030', NULL, '2030-09-01', '2030-11-30', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('7cd97609-32e4-42cc-a111-5b5dd7038c42', 'Last Minute', 'last-minute', 5, '2026-09-01', '2026-10-31', true, false, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "category" WHERE "id" IN ('504fdbe5-592b-46bd-83d9-62e9696a9018', '4e92b73c-aabc-4482-bfbe-ad2d644cd443', 'de657945-1eed-465a-8890-aa4c5e63a956', 'ee497e39-a18c-4a93-abba-f7f77e5272f7', '986c1ce6-6efa-4a60-9001-01106722e0f2', '3ba1d9b9-2183-40b0-a051-013a619a9be0', '2ad8d1c1-a14b-4f94-ac02-fde3ab5fa27b', 'e18dbc61-adbd-437b-8013-ca50e5e2a299', '73a74c50-2317-47f3-a53a-e5e33588dbe7', '498775f7-1a64-4cb8-ac8d-6b65ec78a5ab', 'b97b955a-aa79-4d27-b5bc-ff76eaf31b2c', '2c7dd45f-a5f3-4a60-94cc-f99d21cbd38f', '5fa8882b-fce1-4aa6-91cf-216b12493b01', 'cb8cf3d9-5bc8-463e-a93f-34cb808f9ed0', 'bb71ed9a-053a-4bef-ac1a-77f1b42f3382', '9efac534-e3f7-4891-b7b5-c1e5b7083bfc', '8e97a033-fa06-4f40-ac7c-e8bd47ccf194', '62df0d2e-bf58-4026-8ce4-d0d6359a2ca4', 'eef61d78-842b-47f9-89c8-9cd2fd0afff4', '3e3bc57c-764b-4037-9616-85b1a13c9f67', 'c42412f5-5b32-4c1e-99d7-1c5ceb1672c6', 'd0d1fc29-9876-43ef-848f-cf485647d7b0', 'd5627544-a31c-4cc3-b2b8-4a196d78f463', 'f8ecc221-58cf-4f7c-8a1d-3f9e21f5e99e', '913ade69-5b21-4360-9c5a-f8889531f4d5', '7cd97609-32e4-42cc-a111-5b5dd7038c42')`,
    );
  }
}
