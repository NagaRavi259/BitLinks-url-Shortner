// lib/db.js
// Unified database entry point — reads DB_TYPE from env to select adapter
// Usage:  import { findLink, insertLink } from "@/app/lib/db"

const DB_TYPE = (process.env.DB_TYPE || "sqlite").toLowerCase();

let adapterPromise;

if (DB_TYPE === "mongodb" || DB_TYPE === "mongo") {
  adapterPromise = import("./mongo-adapter");
} else if (DB_TYPE === "sqlite") {
  adapterPromise = import("./sqlite-adapter");
} else {
  throw new Error(
    `Unknown DB_TYPE "${DB_TYPE}". Supported values: "sqlite", "mongodb".`
  );
}

export async function findLink(shortUrl) {
  const adapter = await adapterPromise;
  return adapter.findLink(shortUrl);
}

export async function insertLink(url, shortUrl) {
  const adapter = await adapterPromise;
  return adapter.insertLink(url, shortUrl);
}
