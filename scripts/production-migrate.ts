import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'

async function main() {
  const connectionString = process.env.POSTGRES_URL!
  
  if (!connectionString) {
    console.error('❌ POSTGRES_URL environment variable is not set')
    process.exit(1)
  }
  
  const sql = postgres(connectionString, { max: 1 })
  const db = drizzle(sql)
  
  console.log('🔄 Running migrations...')
  
  try {
    await migrate(db, { migrationsFolder: './lib/db/migrations' })
    console.log('✅ Migrations complete')
  } catch (error) {
    console.error('❌ Migration failed')
    console.error(error)
    await sql.end()
    process.exit(1)
  }
  
  await sql.end()
}

main().catch((err) => {
  console.error('❌ Migration failed')
  console.error(err)
  process.exit(1)
})
