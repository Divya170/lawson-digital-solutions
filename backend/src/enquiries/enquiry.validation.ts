import { FieldErrors } from '../common/field-errors';
import { EMAIL_RE, optInt, raw, str } from '../common/utils';

export interface EnquiryInput {
  name: string;
  email: string;
  company: string;
  service: string;
  budget: string;
  timeline: string;
  url: string;
  description: string;
  /** Honeypot ("website") — people never see or fill it. */
  website: string;
  /** Milliseconds between first keystroke and submit, sent by the form. */
  elapsedMs: number | undefined;
}

export const URL_RE = /^(https?:\/\/)?[^\s/.]+(\.[^\s/.]+)+(\/\S*)?$/i;

/**
 * Same rules and wording as the form in the browser (prototype `validate`), plus
 * checks that the chosen service, budget and timeline are real options.
 */
export function validateEnquiry(
  body: Record<string, unknown>,
  opts: { services: string[]; budgets: string[]; timelines: string[] },
): { errors: FieldErrors; data: EnquiryInput } {
  const e: FieldErrors = {};
  const name = str(body.name);
  const email = str(body.email);
  const description = str(body.description);
  const url = str(body.url);
  const company = str(body.company);
  const service = str(body.service);
  const budget = str(body.budget);
  const timeline = str(body.timeline);

  if (!name) e.name = 'Please enter your name.';
  else if (name.length > 120) e.name = 'Name must be 120 characters or fewer.';

  if (!email) e.email = 'Please enter your email address.';
  else if (email.length > 254 || !EMAIL_RE.test(email)) e.email = 'Enter an email address like name@company.com.';

  if (!description) e.description = 'Please tell us a little about your project.';
  else if (description.length < 20) e.description = 'Please add a bit more detail (at least 20 characters).';
  else if (raw(body.description).length > 4000) e.description = 'Please keep the description under 4,000 characters.';

  if (url && (url.length > 300 || !URL_RE.test(url))) e.url = 'Enter a web address like example.com.';
  if (company.length > 120) e.company = 'Company name must be 120 characters or fewer.';
  if (service && service !== 'unsure' && !opts.services.includes(service)) e.service = 'Choose one of the listed services.';
  if (budget && !opts.budgets.includes(budget)) e.budget = 'Choose one of the listed budget ranges.';
  if (timeline && !opts.timelines.includes(timeline)) e.timeline = 'Choose one of the listed timelines.';

  return {
    errors: e,
    data: { name, email, company, service, budget, timeline, url, description, website: str(body.website), elapsedMs: optInt(body.elapsedMs) },
  };
}
