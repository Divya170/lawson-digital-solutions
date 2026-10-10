import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldValidationException, throwIfErrors } from '../common/field-errors';
import { code, escapeLike, raw, str } from '../common/utils';
import { ContentService } from '../content/content.service';
import { Enquiry, EnquiryStatus } from '../database/entities';
import { validateEnquiry } from './enquiry.validation';

export const ENQUIRY_STATUSES: { value: EnquiryStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'in_review', label: 'In review' },
  { value: 'replied', label: 'Replied' },
  { value: 'closed', label: 'Closed' },
];
const STATUS_KEYS = ENQUIRY_STATUSES.map((s) => s.value as string);

/** Submissions completed faster than this are flagged as possible spam (but still kept). */
const FAST_SUBMIT_MS = 2500;
const FAST_NOTE = '⚑ Submitted unusually fast — possibly automated.';

const dto = (x: Enquiry) => ({
  id: x.id,
  status: x.status,
  name: x.name,
  email: x.email,
  company: x.company,
  serviceId: x.serviceId,
  serviceName: x.serviceName,
  budget: x.budget,
  timeline: x.timeline,
  url: x.url,
  description: x.description,
  staffNotes: x.staffNotes,
  createdAt: new Date(x.createdAt).toISOString(),
  updatedAt: new Date(x.updatedAt).toISOString(),
});

/** Quote a CSV cell and neutralise spreadsheet formulas (=, +, -, @). */
const csvCell = (v: string) => {
  const safe = /^[=+\-@\t\r]/.test(v) ? "'" + v : v;
  return '"' + safe.replace(/"/g, '""') + '"';
};

@Injectable()
export class EnquiriesService {
  constructor(
    @InjectRepository(Enquiry) private readonly repo: Repository<Enquiry>,
    private readonly content: ContentService,
  ) {}

  private async newRef() {
    for (;;) {
      const id = 'E-' + code(6);
      if (!(await this.repo.exists({ where: { id } }))) return id;
    }
  }

  async create(body: Record<string, unknown>) {
    const [names, site] = await Promise.all([this.content.serviceNames(), this.content.site()]);
    const { errors, data } = validateEnquiry(body || {}, {
      services: Object.keys(names).filter((k) => k !== 'unsure'),
      budgets: [...site.budgetRanges, 'Not sure yet', 'Prefer not to say'],
      timelines: site.timelines,
    });
    throwIfErrors(errors);

    // Honeypot filled: answer as if it worked, keep nothing.
    if (data.website) return { ref: 'E-' + code(6), received: true };

    const now = new Date();
    const fast = data.elapsedMs !== undefined && data.elapsedMs >= 0 && data.elapsedMs < FAST_SUBMIT_MS;
    const row = this.repo.create({
      id: await this.newRef(),
      status: 'new',
      name: data.name,
      email: data.email,
      company: data.company,
      serviceId: data.service,
      serviceName: data.service ? names[data.service] || '' : '',
      budget: data.budget,
      timeline: data.timeline,
      url: data.url,
      description: data.description,
      staffNotes: fast ? FAST_NOTE : '',
      createdAt: now,
      updatedAt: now,
    });
    await this.repo.save(row);
    return { ref: row.id, received: true };
  }

  private query(q: Record<string, unknown>) {
    const qb = this.repo.createQueryBuilder('e');
    const status = str(q.status);
    if (STATUS_KEYS.includes(status)) qb.andWhere('e.status = :status', { status });
    const service = str(q.service);
    if (service === 'none') qb.andWhere("e.service_id = ''");
    else if (service) qb.andWhere('e.service_id = :service', { service });
    const term = str(q.q).toLowerCase();
    if (term) {
      qb.andWhere(
        `LOWER(e.id || ' ' || e.name || ' ' || e.email || ' ' || e.company || ' ' || e.description || ' ' || e.url) LIKE :t ESCAPE '\\'`,
        { t: `%${escapeLike(term)}%` },
      );
    }
    return qb.orderBy('e.createdAt', 'DESC');
  }

  async list(q: Record<string, unknown>) {
    const items = await this.query(q).getMany();
    return { items: items.map(dto), ...(await this.totals()) };
  }

  async totals() {
    const rows = await this.repo.createQueryBuilder('e').select('e.status', 'status').addSelect('COUNT(*)', 'n').groupBy('e.status').getRawMany<{ status: string; n: number }>();
    const byStatus: Record<string, number> = Object.fromEntries(STATUS_KEYS.map((k) => [k, 0]));
    let total = 0;
    rows.forEach((r) => {
      byStatus[r.status] = Number(r.n);
      total += Number(r.n);
    });
    return { total, new: byStatus.new, byStatus };
  }

  async get(id: string) {
    const x = await this.repo.findOne({ where: { id } });
    if (!x) throw new NotFoundException('That enquiry no longer exists.');
    return dto(x);
  }

  async update(id: string, body: Record<string, unknown>) {
    const x = await this.repo.findOne({ where: { id } });
    if (!x) throw new NotFoundException('That enquiry no longer exists.');
    if (body.status !== undefined) {
      const s = str(body.status);
      if (!STATUS_KEYS.includes(s)) throw new FieldValidationException({ status: 'Choose a valid status.' });
      x.status = s as EnquiryStatus;
    }
    if (body.staffNotes !== undefined) {
      const n = raw(body.staffNotes).trim();
      if (n.length > 4000) throw new FieldValidationException({ staffNotes: 'Keep notes under 4,000 characters.' });
      x.staffNotes = n;
    }
    x.updatedAt = new Date();
    await this.repo.save(x);
    return dto(x);
  }

  async remove(id: string) {
    const r = await this.repo.delete({ id });
    if (!r.affected) throw new NotFoundException('That enquiry no longer exists.');
    return { id, message: `Enquiry ${id} deleted.` };
  }

  /** CSV of the current filter, newest first. */
  async csv(q: Record<string, unknown>) {
    const items = await this.query(q).getMany();
    const head = ['Reference', 'Received (UTC)', 'Status', 'Name', 'Email', 'Company', 'Service', 'Timeline', 'Budget', 'URL', 'Description', 'Notes'];
    const label = Object.fromEntries(ENQUIRY_STATUSES.map((s) => [s.value, s.label]));
    const rows = items.map((x) =>
      [x.id, new Date(x.createdAt).toISOString().replace('T', ' ').slice(0, 16), label[x.status], x.name, x.email, x.company, x.serviceName, x.timeline, x.budget, x.url, x.description, x.staffNotes]
        .map((v) => csvCell(String(v ?? '')))
        .join(','),
    );
    return '﻿' + [head.map(csvCell).join(','), ...rows].join('\r\n') + '\r\n';
  }
}
