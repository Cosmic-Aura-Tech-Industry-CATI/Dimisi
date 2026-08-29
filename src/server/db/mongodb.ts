/**
 * Server-only MongoDB Client Singleton & Connection Pool Manager
 * Prevents redundant connections during Vite HMR and Serverless executions.
 */
import { MongoClient, type Db, ServerApiVersion } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var __dimisi_mongo_client_promise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var __dimisi_mongo_client: MongoClient | undefined;
}

const DEFAULT_DB_NAME = "dimisi";

/** Read server-only environment variables safely without exposing to client bundle */
function getServerEnv(key: string): string | undefined {
  if (typeof process !== "undefined" && process.env) {
    return process.env[key];
  }
  return undefined;
}

export function getMongoUri(): string | undefined {
  return getServerEnv("MONGODB_URI") || getServerEnv("MONGO_URI");
}

export function getDbName(): string {
  return getServerEnv("MONGODB_DB_NAME") || getServerEnv("MONGO_DB_NAME") || DEFAULT_DB_NAME;
}

/** Check if MongoDB connection parameters are available in the server runtime */
export function isMongoConfigured(): boolean {
  return Boolean(getMongoUri());
}

/**
 * Get or initialize the cached MongoDB client promise.
 */
export async function getMongoClient(): Promise<MongoClient | null> {
  const uri = getMongoUri();
  if (!uri) {
    return null;
  }

  if (globalThis.__dimisi_mongo_client) {
    return globalThis.__dimisi_mongo_client;
  }

  if (!globalThis.__dimisi_mongo_client_promise) {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 5000,
    });

    globalThis.__dimisi_mongo_client_promise = client
      .connect()
      .then((connectedClient) => {
        globalThis.__dimisi_mongo_client = connectedClient;
        console.log(`[mongodb] Connected successfully to database: ${getDbName()}`);
        return connectedClient;
      })
      .catch((err) => {
        globalThis.__dimisi_mongo_client_promise = undefined;
        console.error("[mongodb] Connection failed:", err instanceof Error ? err.message : String(err));
        throw err;
      });
  }

  return globalThis.__dimisi_mongo_client_promise;
}

/**
 * Access the active MongoDB database instance.
 */
export async function getDb(): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) return null;
  return client.db(getDbName());
}

/**
 * Close MongoDB connection gracefully (useful for test suites and server shutdown).
 */
export async function closeMongoConnection(): Promise<void> {
  if (globalThis.__dimisi_mongo_client) {
    await globalThis.__dimisi_mongo_client.close();
    globalThis.__dimisi_mongo_client = undefined;
    globalThis.__dimisi_mongo_client_promise = undefined;
    console.log("[mongodb] Connection pool closed.");
  }
}
