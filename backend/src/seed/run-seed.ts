/**
 * CLI: `npm run seed`        create the database and fill in anything missing (never overwrites).
 *      `npm run seed:reset`  restore services, page content and site settings to the original copy
 *                            (enquiries, case studies and staff accounts are kept).
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { config } from '../config';
import { SeedService } from './seed.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn', 'log'] });
  if (process.argv.includes('--reset')) {
    await app.get(SeedService).resetContent();
    console.log('Content restored to the original copy.');
  }
  console.log(`Database ready at ${config.databasePath}`);
  await app.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
