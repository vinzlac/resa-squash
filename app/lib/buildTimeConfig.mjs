console.log("=== [Build Time Environment Variables] ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("DATABASE_TYPE:", process.env.DATABASE_TYPE);
console.log("POSTGRES_USER:", process.env.POSTGRES_USER);
console.log("POSTGRES_HOST:", process.env.POSTGRES_HOST);
console.log("POSTGRES_DATABASE:", process.env.POSTGRES_DATABASE);
console.log("POSTGRES_URL:", process.env.POSTGRES_URL);
console.log("POSTGRES_PRISMA_URL:", process.env.POSTGRES_PRISMA_URL);
console.log("POSTGRES_URL_NON_POOLING:", process.env.POSTGRES_URL_NON_POOLING);
console.log("=====================================");

export {}; 