import { Queue } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

const connectionOptions = {
  host: process.env.REDIS_HOST, // Redis host in production
  port: parseInt(process.env.REDIS_PORT),
};

/**
 * This queue is only assigned on the "shop/redact" route
 */
export const shopRedactQueue = new Queue("shop/redact-queue", {
  connection: connectionOptions,
});
