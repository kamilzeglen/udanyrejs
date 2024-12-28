import {config as dotenvConfig} from 'dotenv';
import {DataSource} from "typeorm";

dotenvConfig({path: '.env'});

const {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  DATABASE_NAME,
} = process.env;

const MyDataSource = new DataSource({
  type: 'postgres',
  host: DATABASE_HOST,
  port: Number(DATABASE_PORT),
  username: DATABASE_USERNAME,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  migrations: ['dist/migrations/**/*.js'],
  entities: ['dist/modules/**/*.entity.js'],
  logging: true,
})

export default MyDataSource;
