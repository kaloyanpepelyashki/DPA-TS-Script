import { Worker } from "bullmq";

import { shopRedactQueue } from "../Queues/webHooks_queue";
import PgsqlAccessor from "../Database/PgsqlAccessor";
import { errorLogger, generalLog } from "../Loggers/Logger";

export const shopRedactWorker = new Worker("shop/redact-queue", async (job) => {
  const { route, hostName } = job.data;

  try {
    const pgSqlAccessor = new PgsqlAccessor();
    const connectivityCheckResult =
      await pgSqlAccessor.databaseConnectionCheck();

    if (connectivityCheckResult.isSuccess) {
      const queryResult = await pgSqlAccessor.deleteShopRecord(hostName);

      if (queryResult.isSuccess) {
        return;
      }

      throw new Error(
        `Error in shopRedactWorker. \n Job failed. Querring database faild - could not erase records for shop: ${hostName}.`
      );
    }

    throw new Error(
      "Error in shopRedactWorker. \n Job failed. Could not prove database connectivity"
    );
  } catch (e) {
    errorLogger(e);
    throw e;
  }
});

shopRedactWorker.on("completed", (job) => {
  const hostName = job.data;
  generalLog(`Succesfully erased records for shop: ${hostName}`);
});

shopRedactWorker.on("failed", (job, error) => {
  errorLogger(error);
});
