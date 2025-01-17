import { Client } from "pg";
import initConnection from "./PGConnection";
import { errorLogger, logger } from "../Helpers/Logger";

class PgsqlAccessor {
  private client: Client;

  constructor() {
    try {
      this.client = initConnection();

      this.client
        .connect()
        .then(() => {
          logger("Succesfully connected to PostgreSQL database");
        })
        .catch((err) => console.log("Error connecting to database: ", err));
    } catch (e) {
      console.log("Error initialising PgsqlAccessor");
      errorLogger(e);
    }
  }

  public deleteShopRecord() {
    this.client.query("DELETE FROM ");
  }

  public async testDbConnection(): Promise<boolean> {
    const result = await this.client.query("SELECT 1 AS connection_check");
    return result;
  }
}
