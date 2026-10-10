import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldErrors, FieldValidationException, throwIfErrors } from '../common/field-errors';
import { escapeLike, raw, slugify, str } from '../common/utils';
import { ContentService } from '../content/content.service';
import { CaseStudy } from '../database/entities';

const IMAGE_RE = /^(https:\/\/|\/uploads\/)[^\s]+\.(png|jpe?g|webp|avif)(\?.*)?$/i;

@Injectable()
export class CaseStudiesService {
  constructor(
    @InjectRepository(CaseStudy) private readonly repo: Repository<CaseStudy>,
    private readonly content: ContentService,
  ) {}

  private async dto(x: CaseStudy, names?: Record<string, string>) {
    const n = names || (await this.content.serviceNames());
    return {
      id: x.id,
      slug: x.slug,
      title: x.title,
      client: x.client,
      serviceId: x.serviceId,
      serviceName: x.serviceId ? n[x.serviceId] || '' : '',
      summary: x.summary,
      requirement: x.requirement,
      approach: x.approach,
      delivered: x.delivered,
      results: x.results,
      coverImage: x.coverImage,
      status: x.status,
      publishedAt: x.publishedAt ? new Date(x.publishedAt).toISOString() : null,
      createdAt: new Date(x.createdAt).toISOString(),
      updatedAt: new Date(x.updatedAt).toISOString(),
    };
  }

  private async many(list: CaseStudy[]) {
    const names = await this.content.serviceNames();
    return Promise.all(list.map((x) => this.dto(x, names)));
  }

  /* ------------------------------ Public ------------------------------ */

  async listPublished() {
    return this.many(await this.repo.find({ where: { status: 'published' }, order: { publishedAt: 'DESC', id: 'DESC' } }));
  }

  async getPublished(slug: string) {
    const x = await this.repo.findOne({ where: { slug, status: 'published' } });
    if (!x) throw new NotFoundException('That case study isn’t published.');
    return this.dto(x);
  }

  /* ------------------------------- Staff ------------------------------ */

  async listAdmin(q: Record<string, unknown>) {
    const qb = this.repo.createQueryBuilder('c');
    const status = str(q.status);
    if (status === 'draft' || status === 'published') qb.andWhere('c.status = :status', { status });
    const term = str(q.q).toLowerCase();
    if (term) qb.andWhere(`LOWER(c.title || ' ' || c.client || ' ' || c.summary) LIKE :t ESCAPE '\\'`, { t: `%${escapeLike(term)}%` });
    const items = await this.many(await qb.orderBy('c.updatedAt', 'DESC').getMany());
    return { items, ...(await this.totals()) };
  }

  async totals() {
    const total = await this.repo.count();
    const published = await this.repo.count({ where: { status: 'published' } });
    return { total, published, drafts: total - published };
  }

  async getAdmin(id: number) {
    const x = await this.repo.findOne({ where: { id } });
    if (!x) throw new NotFoundException('That case study no longer exists.');
    return this.dto(x);
  }

  async save(id: number | null, body: Record<string, unknown>) {
    const existing = id ? await this.repo.findOne({ where: { id } }) : null;
    if (id && !existing) throw new NotFoundException('That case study no longer exists.');
    const names = await this.content.serviceNames();

    const e: FieldErrors = {};
    const title = str(body.title);
    const slug = slugify(str(body.slug) || title);
    const client = str(body.client);
    const serviceId = str(body.serviceId);
    const summary = str(body.summary);
    const coverImage = str(body.coverImage);
    const status = str(body.status) === 'published' ? 'published' : 'draft';
    const sections = Object.fromEntries(['requirement', 'approach', 'delivered', 'results'].map((k) => [k, raw(body[k]).trim()])) as Record<string, string>;

    if (!title) e.title = 'Enter a title.'; else if (title.length > 160) e.title = 'Keep the title under 160 characters.';
    if (!slug) e.slug = 'Enter a URL slug using letters and numbers.';
    if (client.length > 120) e.client = 'Keep the client name under 120 characters.';
    if (serviceId && (serviceId === 'unsure' || !names[serviceId])) e.serviceId = 'Choose one of the listed services.';
    if (summary.length > 400) e.summary = 'Keep the summary under 400 characters.';
    if (coverImage && !IMAGE_RE.test(coverImage)) e.coverImage = 'Use an uploaded image or an https:// URL ending in .png, .jpg, .webp or .avif.';
    for (const k of Object.keys(sections)) if (sections[k].length > 6000) e[k] = 'Keep this section under 6,000 characters.';
    // A published case study must be complete; drafts can be partial.
    if (status === 'published') {
      if (!summary) e.summary = 'Add a summary before publishing.';
      if (!sections.requirement) e.requirement = 'Add the requirement before publishing.';
      if (!sections.approach) e.approach = 'Add the approach before publishing.';
      if (!sections.delivered) e.delivered = 'Add what was delivered before publishing.';
    }
    if (slug && !e.slug) {
      const clash = await this.repo.findOne({ where: { slug } });
      if (clash && clash.id !== id) e.slug = `“${slug}” is already used by “${clash.title}”.`;
    }
    throwIfErrors(e);

    const now = new Date();
    const x = existing || this.repo.create({ createdAt: now, publishedAt: null });
    Object.assign(x, { title, slug, client, serviceId, summary, coverImage, status, ...sections, updatedAt: now });
    if (status === 'published' && !x.publishedAt) x.publishedAt = now;
    if (status === 'draft') x.publishedAt = null;
    const saved = await this.repo.save(x);
    return this.dto(saved, names);
  }

  async setStatus(id: number, status: string) {
    const x = await this.repo.findOne({ where: { id } });
    if (!x) throw new NotFoundException('That case study no longer exists.');
    if (status !== 'draft' && status !== 'published') throw new FieldValidationException({ status: 'Choose draft or published.' });
    // Re-use full validation so incomplete drafts can't be published from the list view.
    return this.save(id, { ...(await this.dto(x)), status });
  }

  async remove(id: number) {
    const x = await this.repo.findOne({ where: { id } });
    if (!x) throw new NotFoundException('That case study no longer exists.');
    await this.repo.delete({ id });
    return { id, message: `“${x.title}” deleted.` };
  }
}
