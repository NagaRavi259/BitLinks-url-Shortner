// lib/mongo-adapter.js
// MongoDB adapter — wraps the existing clientPromise

import clientPromise from "./mongodb"

async function getCollection() {
  const client = await clientPromise;
  const db = client.db('bitLinks');
  return db.collection('links');
}

export async function findLink(shortUrl) {
  const collection = await getCollection();
  const doc = await collection.findOne({ shortUrl });
  return doc ? { url: doc.url, shortUrl: doc.shortUrl } : null;
}

export async function insertLink(url, shortUrl) {
  const collection = await getCollection();
  await collection.insertOne({ url, shortUrl });
  return true;
}
