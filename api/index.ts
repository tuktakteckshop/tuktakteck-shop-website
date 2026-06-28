import { startServer } from "../server";

let appPromise: any = null;

try {
  appPromise = startServer();
} catch (startupErr: any) {
  console.error("Vercel Startup Error caught at top-level:", startupErr);
}

export default async function handler(req: any, res: any) {
  try {
    if (!appPromise) {
      appPromise = startServer();
    }
    const app = await appPromise;
    return app(req, res);
  } catch (err: any) {
    console.error("Vercel Request Error:", err);
    res.status(500).json({
      error: "Internal Server Error during serverless function execution",
      message: err.message,
      stack: err.stack,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL
      }
    });
  }
}

