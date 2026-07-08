import mongoose from 'mongoose';
import dns from 'dns';

let isConnected = false;

export async function connectMongo(): Promise<void> {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[MongoDB] MONGODB_URI not set — skipping database connection.');
    return;
  }

  // Configure public DNS servers to resolve MongoDB Atlas SRV connection string on Windows
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  } catch (dnsErr: any) {
    console.warn('[MongoDB] Failed to set custom DNS servers:', dnsErr?.message);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });
    isConnected = true;
    console.log('[MongoDB] Connected to MongoDB Atlas ✓');

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.warn('[MongoDB] Disconnected. Will reconnect on next request.');
    });
  } catch (err: any) {
    console.error('[MongoDB] Connection failed:', err?.message || err);
    console.warn('[MongoDB] Tip: Go to MongoDB Atlas → Network Access → Add 0.0.0.0/0 to allow all IPs.');
    // Non-fatal — app still works without DB
  }
}

export async function ensureConnected(): Promise<void> {
  if (!isConnected) {
    await connectMongo();
  }
}
