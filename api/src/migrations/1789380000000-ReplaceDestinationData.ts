import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReplaceDestinationData1789380000000 implements MigrationInterface {
  public readonly name = 'ReplaceDestinationData1789380000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "offer_destinations"`);
    await queryRunner.query(`DELETE FROM "destination"`);
    await queryRunner.query(`
      INSERT INTO "destination" ("id", "name", "isActive", "createdById", "updatedById")
      VALUES
        ('5c17e511-9a36-491f-a9e3-12a6899f2a86', 'Afryka', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('2a583c45-c5a2-4f42-89bf-7f0aa1bb85da', 'Ameryka Środkowa', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('0481fe02-ef12-4e71-b20d-628b25d261eb', 'Antarktyda', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('5cfb80a0-2d24-4324-bb87-35cf45e8e5b6', 'Arktyka', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('c48f86c1-ce25-4372-8fbd-7fc814e32301', 'Australia i Nowa Zelandia', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('8ff8a576-c0f2-4ff7-91fb-b21e5bb821b5', 'Azja', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('cfe55d5c-195e-44bf-86e9-626be154cf2b', 'Bermudy', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('f43c3b16-1108-4378-a8c2-9d4c99b178d9', 'Dubaj i Zjednoczone Emiraty Arabskie', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('27f667f9-5756-44ad-a5e5-b6ca529093f0', 'Europa Północna', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('9d1435c7-0645-482b-8236-77c685c23c13', 'Galapagos', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('810c6076-2560-4631-bbe0-1e502060fedd', 'Hawaje', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('6334c654-1a28-476a-ae71-99fd018d22ac', 'Kanada i Nowa Anglia', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('91a380dd-e23e-4dc4-a3de-38280fe65191', 'Kanał Panamski', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('7488292e-e75c-4173-9348-bd8a4f8fd463', 'Morze Adriatyckie', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('1677f654-8d1f-4f36-8bd7-9d222313ef31', 'Morze Egejskie', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('2d03fa91-2769-4b34-83e9-bc813523ef93', 'Ocean Indyjski', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('dfb773cb-bbb7-4d18-bf18-bc3b0ba801eb', 'Polinezja Francuska', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('a9c5f088-315f-42d3-a406-c20d21db6d14', 'Południowy Pacyfik', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('dc9478a0-fde9-4367-aa0d-f0bb06601196', 'Półwysep Arabski', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('9ee87d8c-0c07-4119-9d0e-2baa0bd41167', 'Riwiera Meksykańska', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('5cea3ba1-1aff-4715-815b-49d571111244', 'Wyspy Greckie', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('bac34d70-cfb0-47eb-9b28-1526d632e0fb', 'Wyspy Oceanu Atlantyckiego', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('73a057e0-51dd-477b-a3d1-4e588f642478', 'Atlantyckie wybrzeże Europy', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('7ca02b61-9185-4af0-b9c4-8df06a27b174', 'Wschodnie wybrzeże USA', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('c4bd09bc-ea5f-4bc7-9ec7-465c2e1f4269', 'Kanada Zachodnia', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('758820c2-3589-4e4d-9c37-ae4d11be4748', 'Zachodnie wybrzeże USA', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('e6ea1d9d-f1a8-48ed-91f4-09037e023c6b', 'Wyspy Kanaryjskie', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('270593b5-3073-4fd5-ad8b-304bb16f7cce', 'Alaska', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('13939020-4e5e-465d-a308-aaec9e3831e5', 'Karaiby', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('57b2d06a-736c-40b4-b5ca-37e4ba5fd880', 'Norweskie Fiordy', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('381f2e8f-6eb3-4604-892e-2c4342dea77f', 'Morze Bałtyckie', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('b78d27fe-f0be-4e6a-827e-e7a67091a1fc', 'Morze Śródziemne', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('8e80bac8-e7af-4bb8-b3d3-fa5bb955fe80', 'Europa', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('90ecd917-6699-44c8-b459-1029e2cd0c6c', 'Bahamy', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('157f7db4-ee11-4602-9e23-b2ed7273e817', 'Ameryka Północna', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d'),
        ('784627ed-91d4-44f2-a611-654866e62fd8', 'Ameryka Południowa', true, '12345678-3cf2-4e11-87c2-f6a75aa28f8d', '12345678-3cf2-4e11-87c2-f6a75aa28f8d')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "destination" WHERE "id" IN ('5c17e511-9a36-491f-a9e3-12a6899f2a86', '2a583c45-c5a2-4f42-89bf-7f0aa1bb85da', '0481fe02-ef12-4e71-b20d-628b25d261eb', '5cfb80a0-2d24-4324-bb87-35cf45e8e5b6', 'c48f86c1-ce25-4372-8fbd-7fc814e32301', '8ff8a576-c0f2-4ff7-91fb-b21e5bb821b5', 'cfe55d5c-195e-44bf-86e9-626be154cf2b', 'f43c3b16-1108-4378-a8c2-9d4c99b178d9', '27f667f9-5756-44ad-a5e5-b6ca529093f0', '9d1435c7-0645-482b-8236-77c685c23c13', '810c6076-2560-4631-bbe0-1e502060fedd', '6334c654-1a28-476a-ae71-99fd018d22ac', '91a380dd-e23e-4dc4-a3de-38280fe65191', '7488292e-e75c-4173-9348-bd8a4f8fd463', '1677f654-8d1f-4f36-8bd7-9d222313ef31', '2d03fa91-2769-4b34-83e9-bc813523ef93', 'dfb773cb-bbb7-4d18-bf18-bc3b0ba801eb', 'a9c5f088-315f-42d3-a406-c20d21db6d14', 'dc9478a0-fde9-4367-aa0d-f0bb06601196', '9ee87d8c-0c07-4119-9d0e-2baa0bd41167', '5cea3ba1-1aff-4715-815b-49d571111244', 'bac34d70-cfb0-47eb-9b28-1526d632e0fb', '73a057e0-51dd-477b-a3d1-4e588f642478', '7ca02b61-9185-4af0-b9c4-8df06a27b174', 'c4bd09bc-ea5f-4bc7-9ec7-465c2e1f4269', '758820c2-3589-4e4d-9c37-ae4d11be4748', 'e6ea1d9d-f1a8-48ed-91f4-09037e023c6b', '270593b5-3073-4fd5-ad8b-304bb16f7cce', '13939020-4e5e-465d-a308-aaec9e3831e5', '57b2d06a-736c-40b4-b5ca-37e4ba5fd880', '381f2e8f-6eb3-4604-892e-2c4342dea77f', 'b78d27fe-f0be-4e6a-827e-e7a67091a1fc', '8e80bac8-e7af-4bb8-b3d3-fa5bb955fe80', '90ecd917-6699-44c8-b459-1029e2cd0c6c', '157f7db4-ee11-4602-9e23-b2ed7273e817', '784627ed-91d4-44f2-a611-654866e62fd8')`,
    );
  }
}
