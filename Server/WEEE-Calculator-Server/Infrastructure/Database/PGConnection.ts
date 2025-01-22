import { Client, ClientConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

const PGSQL_USERNAME: string = process.env.PGSQL_USERNAME;
const PGSQL_PASSWORD: string = process.env.PGSQL_PASSWORD;
const PGSQL_HOST: string = process.env.PGSQL_HOST;
const PGSQL_PORT: number = parseInt(process.env.PGSQL_PORT);
const PGSQL_DB_NAME: string = process.env.PGSQL_DB_NAME;

export default function initConnection() {
  try {
    const dbConnectionObject: ClientConfig = {
      user: PGSQL_USERNAME,
      password: PGSQL_PASSWORD,
      host: PGSQL_HOST,
      port: PGSQL_PORT,
      database: PGSQL_DB_NAME,
    };

    const client = new Client(dbConnectionObject);

    return client;
  } catch (e) {
    throw e;
  }
}
