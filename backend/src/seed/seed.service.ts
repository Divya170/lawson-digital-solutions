import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { ContentBlock, Service, SiteSettings } from '../database/entities';
import { SEED_CONTENT, SEED_SERVICES, SEED_SETTINGS } from './seed.data';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly log = new Logger('Seed');

  constructor(
    @InjectDataSource() private readonly ds: DataSource,
    private readonly auth: AuthService,
  ) {}

  /** Fills anything that's missing: settings, services, content blocks, the first staff account. Never overwrites. */
  async onApplicationBootstrap() {
    const now = new Date();
    const settings = this.ds.getRepository(SiteSettings);
    if (!(await settings.exists({ where: { id: 1 } }))) {
      await settings.insert({ id: 1, ...SEED_SETTINGS, updatedAt: now });
      this.log.log('Created site settings.');
    }
    const services = this.ds.getRepository(Service);
    if (!(await services.count())) {
      await services.insert(SEED_SERVICES.map((s, i) => ({ ...s, sortOrder: i, updatedAt: now })));
      this.log.log(`Seeded ${SEED_SERVICES.length} services.`);
    }
    const blocks = this.ds.getRepository(ContentBlock);
    const have = new Set((await blocks.find({ select: { key: true } })).map((b) => b.key));
    const missing = Object.keys(SEED_CONTENT).filter((k) => !have.has(k));
    if (missing.length) {
      await blocks.insert(missing.map((key) => ({ key, data: SEED_CONTENT[key], updatedAt: now })));
      this.log.log(`Seeded content: ${missing.join(', ')}.`);
    }
    await this.auth.ensureSeedUser();
  }

  /** Restore services, page content and site settings to the original copy. Enquiries and case studies are kept. */
  async resetContent() {
    const now = new Date();
    await this.ds.transaction(async (m) => {
      await m.clear(Service);
      await m.clear(ContentBlock);
      await m.delete(SiteSettings, { id: 1 });
      await m.insert(Service, SEED_SERVICES.map((s, i) => ({ ...s, sortOrder: i, updatedAt: now })));
      await m.insert(ContentBlock, Object.entries(SEED_CONTENT).map(([key, data]) => ({ key, data, updatedAt: now })));
      await m.insert(SiteSettings, { id: 1, ...SEED_SETTINGS, updatedAt: now });
    });
    return { message: 'Content restored.' };
  }
}
