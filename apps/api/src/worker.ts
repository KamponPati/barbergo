import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrapWorker(): Promise<void> {
  // Worker process for background jobs (BullMQ/event handlers).
  // Keeps shared modules initialized without opening an HTTP listener.
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ["log", "error", "warn"]
  });

  const shutdown = async (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`[worker] received ${signal}, shutting down...`);
    await app.close();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  // eslint-disable-next-line no-console
  console.log("[worker] started");
}

void bootstrapWorker();

