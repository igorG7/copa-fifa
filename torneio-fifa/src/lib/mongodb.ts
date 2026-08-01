import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "torneio-fifa";

if (!uri) {
  // Só lança em runtime (dentro de uma rota), não durante o build.
  console.warn(
    "MONGODB_URI não definida. Configure o arquivo .env com base em .env.example."
  );
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error(
      "MONGODB_URI não configurada. Defina essa variável de ambiente."
    );
  }

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      const client = new MongoClient(uri);
      global._mongoClientPromise = client.connect();
    }
    return global._mongoClientPromise;
  }

  const client = new MongoClient(uri);
  return client.connect();
}

let cachedPromise: Promise<MongoClient> | null = null;

export async function getDb(): Promise<Db> {
  if (!cachedPromise) {
    cachedPromise = getClientPromise();
  }
  const client = await cachedPromise;
  return client.db(dbName);
}
