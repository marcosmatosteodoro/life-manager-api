import 'dotenv/config';
import { join } from 'path';
import { DataSource } from 'typeorm';

/**
 * DataSource usado pela CLI do TypeORM (migrations).
 * Lê as MESMAS variáveis de ambiente do app (ver app.module.ts).
 *
 * Globs com {ts,js} + __dirname funcionam nos dois modos:
 * - ts-node a partir de src/ (migration:generate)
 * - JS compilado a partir de dist/ (migration:run no build da Vercel)
 */
export default new DataSource({
  type: (process.env.DB_TYPE as 'postgres' | 'mysql') ?? 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [join(__dirname, '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
