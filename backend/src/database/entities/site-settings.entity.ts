import { Column, Entity, PrimaryColumn } from 'typeorm';

/** Single-row table (id = 1): business contact details and enquiry-form options. */
@Entity('site_settings')
export class SiteSettings {
  @PrimaryColumn({ type: 'integer' })
  id: number;

  @Column({ name: 'business_name', type: 'varchar', length: 120 })
  businessName: string;

  @Column({ name: 'contact_name', type: 'varchar', length: 120 })
  contactName: string;

  @Column({ type: 'varchar', length: 254 })
  email: string;

  @Column({ type: 'varchar', length: 40 })
  phone: string;

  @Column({ type: 'varchar', length: 160 })
  street: string;

  /** e.g. "Austin, TX 78701, USA" */
  @Column({ type: 'varchar', length: 160 })
  locality: string;

  /** Short location label for the live clock, e.g. "Austin, TX". */
  @Column({ name: 'location_label', type: 'varchar', length: 80 })
  locationLabel: string;

  /** IANA time zone for the live clock, e.g. "America/Chicago". */
  @Column({ type: 'varchar', length: 60 })
  timezone: string;

  @Column({ name: 'budget_ranges', type: 'simple-json' })
  budgetRanges: string[];

  @Column({ type: 'simple-json' })
  timelines: string[];

  @Column({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
