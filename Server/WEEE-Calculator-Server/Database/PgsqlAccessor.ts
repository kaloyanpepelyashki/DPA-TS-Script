import { Client } from "pg";
import initConnection from "./PGConnection";
import { errorLogger, generalLog } from "../Helpers/Logger";

class PgsqlAccessor {
  private client: Client;

  constructor() {
    try {
      this.client = initConnection();

      this.client
        .connect()
        .then(() => {
          generalLog("Succesfully connected to PostgreSQL database");
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

  /**
   * This method is responsible for checking if the server connects to PGSql (the right database) in production
   */
  public async databaseConnectionCheck(): Promise<{
    isSuccess: boolean;
    errorMessage?: string;
    error?: any;
  }> {
    try {
      const result = await this.client.query("SELECT 1 AS connection_check");
      return { isSuccess: true };
    } catch (e) {
      return { isSuccess: false, errorMessage: e.message, error: e };
    }
  }
}

export default PgsqlAccessor;
