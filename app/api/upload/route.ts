export async function POST() {
  return Response.json({
    NODE_ENV: process.env.NODE_ENV,
    HAS_TOKEN: !!process.env.BLOB_READ_WRITE_TOKEN,
    HAS_STORE_ID: !!process.env.BLOB_STORE_ID,
    HAS_WEBHOOK: !!process.env.BLOB_WEBHOOK_PUBLIC_KEY,
    BLOB_KEYS: Object.keys(process.env).filter((key) => key.includes("BLOB")),
  });
}
