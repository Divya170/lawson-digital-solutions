import './config';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { config } from './config';
import { ENTITIES } from './database/entities';
import { CaseStudiesModule } from './case-studies/case-studies.module';
import { ContentModule } from './content/content.module';
import { EnquiriesModule } from './enquiries/enquiries.module';
import { UploadsModule } from './uploads/uploads.module';

mkdirSync(dirname(config.databasePath), { recursive: true });

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: config.databasePath,
      entities: ENTITIES,
      // Schema is created/updated from the entities. Swap for migrations before going to production.
      synchronize: true,
      prepareDatabase: (db: { pragma: (s: string) => unknown }) => {
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');
      },
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    AuthModule,
    ContentModule,
    EnquiriesModule,
    CaseStudiesModule,
    UploadsModule,
    AdminModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
