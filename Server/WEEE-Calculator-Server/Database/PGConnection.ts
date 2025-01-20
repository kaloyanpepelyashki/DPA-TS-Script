import { Client, ClientConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

const PGSQL_USERNAME: string = "";
const PGSQL_PASSWORD: string = "";
const PGSQL_HOST: string = "";
const PGSQL_PORT: number = 0;
const PGSQL_DB_NAME: string = "";

export default function initConnection() {
  try {
    const dbConnectionObject: ClientConfig = {
      user: PGSQL_USERNAME,
      password: PGSQL_PASSWORD as string,
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
