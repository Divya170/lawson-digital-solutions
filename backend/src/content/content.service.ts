import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FieldErrors, throwIfErrors } from '../common/field-errors';
import { EMAIL_RE, lines, str } from '../common/utils';
import { ContentBlock, Service, SiteSettings } from '../database/entities';

const pad = (i: number) => String(i + 1).padStart(2, '0');

export const serviceDto = (s: Service, i: number) => ({
  id: s.id,
  n: pad(i),
  tag: s.tag,
  name: s.name,
  short: s.short,
  outcome: s.outcome,
  purpose: s.purpose,
  problems: s.problems,
  considerations: s.considerations,
  deliverables: s.deliverables,
  flow: s.flow,
  updatedAt: new Date(s.updatedAt).toISOString(),
});

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Service) private readonly services: Repository<Service>,
    @InjectRepository(ContentBlock) private readonly blocks: Repository<ContentBlock>,
    @InjectRepository(SiteSettings) private readonly settings: Repository<SiteSettings>,
  ) {}

  /* ------------------------------ Services ------------------------------ */

  async listServices() {
    const rows = await this.services.find({ order: { sortOrder: 'ASC' } });
    return rows.map(serviceDto);
  }

  /** id → name, plus "unsure", for labelling enquiries. */
  async serviceNames(): Promise<Record<string, string>> {
    const rows = await this.services.find();
    return { ...Object.fromEntries(rows.map((s) => [s.id, s.name])), unsure: 'Not sure yet' };
  }

  async updateService(id: string, body: Record<string, unknown>) {
    const s = await this.services.findOne({ where: { id } });
    if (!s) throw new NotFoundException('That service no longer exists.');
    const e: FieldErrors = {};
    const name = str(body.name), tag = str(body.tag).toUpperCase(), short = str(body.short), outcome = str(body.outcome), purpose = str(body.purpose);
    const problems = lines(body.problems), considerations = lines(body.considerations), deliverables = lines(body.deliverables), flow = lines(body.flow);
    if (!name) e.name = 'Enter the service name.'; else if (name.length > 80) e.name = 'Keep the name under 80 characters.';
    if (!tag) e.tag = 'Enter a short tag, e.g. APP.'; else if (!/^[A-Z0-9?]{1,6}$/.test(tag)) e.tag = 'Use up to 6 letters or numbers.';
    if (!short) e.short = 'Enter a one-line summary.'; else if (short.length > 240) e.short = 'Keep the summary under 240 characters.';
    if (!outcome) e.outcome = 'Enter the outcome line.'; else if (outcome.length > 160) e.outcome = 'Keep the outcome under 160 characters.';
    if (!purpose) e.purpose = 'Enter the introduction.'; else if (purpose.length > 600) e.purpose = 'Keep the introduction under 600 characters.';
    const listRule = (k: string, v: string[], min: number, max: number) => {
      if (v.length < min) e[k] = `Add at least ${min} ${min === 1 ? 'line' : 'lines'}.`;
      else if (v.length > max) e[k] = `Use at most ${max} lines.`;
      else if (v.some((x) => x.length > 160)) e[k] = 'Keep each line under 160 characters.';
    };
    listRule('problems', problems, 1, 8);
    listRule('considerations', considerations, 1, 8);
    listRule('deliverables', deliverables, 1, 10);
    if (flow.length !== 3) e.flow = 'Enter exactly three steps, one per line.'; else if (flow.some((x) => x.length > 40)) e.flow = 'Keep each step under 40 characters.';
    throwIfErrors(e);
    Object.assign(s, { name, tag, short, outcome, purpose, problems, considerations, deliverables, flow, updatedAt: new Date() });
    await this.services.save(s);
    const all = await this.services.find({ order: { sortOrder: 'ASC' } });
    return serviceDto(s, all.findIndex((x) => x.id === s.id));
  }

  /* --------------------------- Page content ---------------------------- */

  /** Everything the public pages render, in one payload. */
  async content() {
    const [services, blocks, site] = await Promise.all([this.listServices(), this.blocks.find(), this.site()]);
    const b = Object.fromEntries(blocks.map((x) => [x.key, x.data]));
    return {
      services,
      hero: b.hero ?? [],
      stages: b.stages ?? [],
      marquee: b.marquee ?? [],
      challenges: b.challenges ?? [],
      process: b.process ?? [],
      principles: b.principles ?? [],
      values: b.values ?? [],
      solutions: b.solutions ?? [],
      caseOutline: b.caseOutline ?? [],
      scopeExample: b.scopeExample ?? { goal: '', users: '', items: [] },
      prompts: b.prompts ?? [],
      budgets: [...site.budgetRanges, 'Not sure yet', 'Prefer not to say'],
      timelines: site.timelines,
    };
  }

  /* ----------------------------- Settings ------------------------------ */

  private async row() {
    const s = await this.settings.findOne({ where: { id: 1 } });
    if (!s) throw new NotFoundException('Site settings are missing. Run `npm run seed`.');
    return s;
  }

  /** Public contact details plus ready-made tel: and mailto: links. */
  async site() {
    const s = await this.row();
    return {
      businessName: s.businessName,
      contactName: s.contactName,
      email: s.email,
      mailto: 'mailto:' + s.email,
      phone: s.phone,
      tel: 'tel:' + s.phone.replace(/[^\d+]/g, ''),
      street: s.street,
      locality: s.locality,
      locationLabel: s.locationLabel,
      timezone: s.timezone,
      budgetRanges: s.budgetRanges,
      timelines: s.timelines,
      updatedAt: new Date(s.updatedAt).toISOString(),
    };
  }

  async updateSettings(body: Record<string, unknown>) {
    const e: FieldErrors = {};
    const businessName = str(body.businessName), contactName = str(body.contactName), email = str(body.email), phone = str(body.phone);
    const street = str(body.street), locality = str(body.locality), locationLabel = str(body.locationLabel), timezone = str(body.timezone);
    const budgetRanges = lines(body.budgetRanges), timelines = lines(body.timelines);
    if (!businessName) e.businessName = 'Enter the business name.';
    if (!contactName) e.contactName = 'Enter the contact name.';
    if (!email) e.email = 'Enter an email address.'; else if (!EMAIL_RE.test(email) || email.length > 254) e.email = 'Enter an email address like name@company.com.';
    const digits = phone.replace(/\D/g, '');
    if (!phone) e.phone = 'Enter a phone number.'; else if (digits.length < 10 || digits.length > 15) e.phone = 'Enter a valid phone number, including the area code.';
    if (!street) e.street = 'Enter the street address.';
    if (!locality) e.locality = 'Enter the city, state, ZIP and country.';
    if (!locationLabel) e.locationLabel = 'Enter a short location label, e.g. Austin, TX.';
    if (!timezone) e.timezone = 'Enter a time zone, e.g. America/Chicago.';
    else {
      try {
        new Intl.DateTimeFormat('en-US', { timeZone: timezone });
      } catch {
        e.timezone = 'That isn’t a recognised time zone. Use a name like America/Chicago.';
      }
    }
    if (budgetRanges.length < 1 || budgetRanges.length > 8) e.budgetRanges = 'List between 1 and 8 budget ranges, one per line.';
    else if (budgetRanges.some((x) => x.length > 40)) e.budgetRanges = 'Keep each range under 40 characters.';
    if (timelines.length < 1 || timelines.length > 8) e.timelines = 'List between 1 and 8 timeline options, one per line.';
    else if (timelines.some((x) => x.length > 40)) e.timelines = 'Keep each option under 40 characters.';
    for (const [k, v, max] of [['businessName', businessName, 120], ['contactName', contactName, 120], ['street', street, 160], ['locality', locality, 160], ['locationLabel', locationLabel, 80]] as const) {
      if (v.length > max && !e[k]) e[k] = `Keep this under ${max} characters.`;
    }
    throwIfErrors(e);
    const s = await this.row();
    Object.assign(s, { businessName, contactName, email, phone, street, locality, locationLabel, timezone, budgetRanges, timelines, updatedAt: new Date() });
    await this.settings.save(s);
    return this.site();
  }
}
