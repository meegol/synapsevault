import { MongoClient } from 'mongodb';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {}

const uri = process.env.MONGODB_URI;
let cachedClient = null;
let cachedDb = null;

/**
 * Connect to MongoDB Atlas with connection caching for serverless
 */
export async function connectToDatabase() {
  if (!uri) return null;

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000
    });

    await client.connect();
    const db = client.db('synapsevault');

    cachedClient = client;
    cachedDb = db;
    return { client, db };
  } catch (err) {
    console.warn('[MongoDB Atlas] Connection notice:', err.message);
    return null;
  }
}

export function isMongoConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

export async function getMongoDocs() {
  const conn = await connectToDatabase();
  if (!conn) return null;
  try {
    const docs = await conn.db.collection('documents').find({}).sort({ createdAt: -1 }).toArray();
    return docs.map(d => {
      const { _id, ...rest } = d;
      return rest;
    });
  } catch (err) {
    console.warn('[MongoDB Atlas] Read error:', err.message);
    return null;
  }
}

export async function saveMongoDoc(doc) {
  const conn = await connectToDatabase();
  if (!conn) return null;
  try {
    await conn.db.collection('documents').updateOne(
      { id: doc.id },
      { $set: doc },
      { upsert: true }
    );
    return doc;
  } catch (err) {
    console.warn('[MongoDB Atlas] Save error:', err.message);
    return null;
  }
}

export async function deleteMongoDoc(id) {
  const conn = await connectToDatabase();
  if (!conn) return null;
  try {
    await conn.db.collection('documents').deleteOne({ id });
    return true;
  } catch (err) {
    console.warn('[MongoDB Atlas] Delete error:', err.message);
    return null;
  }
}

export async function syncMongoVault(documents) {
  const conn = await connectToDatabase();
  if (!conn || !Array.isArray(documents)) return null;
  try {
    const collection = conn.db.collection('documents');
    await collection.deleteMany({});
    if (documents.length > 0) {
      await collection.insertMany(documents);
    }
    return documents;
  } catch (err) {
    console.warn('[MongoDB Atlas] Sync error:', err.message);
    return null;
  }
}
