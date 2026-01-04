import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Connection pool for database operations
const connectionString = process.env.DATABASE_URL

export default {
  earlyAccess: true,
  schema: path.join(__dirname, 'schema.prisma'),

  // Database URL for CLI tools (db push, migrate, etc.)
  datasource: {
    url: connectionString,
  },

  // Adapter for Prisma Client runtime
  migrate: {
    adapter: async () => {
      const pool = new Pool({ connectionString })
      return new PrismaPg(pool)
    },
  },
}
