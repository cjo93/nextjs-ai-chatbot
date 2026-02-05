import { exec } from 'child_process'
import { promisify } from 'util'
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'

const execAsync = promisify(exec)

async function backup() {
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0]
  const filename = `backup-${timestamp}.sql`
  const backupDir = 'backups'
  
  if (!existsSync(backupDir)) {
    await mkdir(backupDir, { recursive: true })
  }
  
  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL environment variable is not set')
    process.exit(1)
  }
  
  try {
    console.log('🔄 Creating database backup...')
    await execAsync(
      `pg_dump ${process.env.POSTGRES_URL} > ${backupDir}/${filename}`
    )
    console.log(`✅ Backup created: ${backupDir}/${filename}`)
  } catch (error) {
    console.error('❌ Backup failed')
    console.error(error)
    process.exit(1)
  }
}

backup()
