export default async function ServerLogger() {
  console.log("DATABASE_TYPE (server):", process.env.DATABASE_TYPE);
  return null;
} 