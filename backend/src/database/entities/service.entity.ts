import { Column, Entity, PrimaryColumn } from 'typeorm';

/** One of the four service lines ("custom", "web", "consulting", "integration"). */
@Entity('services')
export class Service {
  /** URL-safe id used in links, e.g. /services?s=custom and /contact?service=custom. */
  @PrimaryColumn({ type: 'varchar', length: 40 })
  id: string;

  @Column({ name: 'sort_order', type: 'integer', default: 0 })
  sortOrder: number;

  /** Short label shown in mono type, e.g. "APP". */
  @Column({ type: 'varchar', length: 12 })
  tag: string;

  @Column({ type: 'varchar', length: 80 })
  name: string;

  /** One-line summary used on the homepage capabilities list. */
  @Column({ type: 'text' })
  short: string;

  /** Outcome line shown on the capabilities preview card. */
  @Column({ type: 'varchar', length: 160 })
  outcome: string;

  /** Longer introduction on the services page. */
  @Column({ type: 'text' })
  purpose: string;

  @Column({ type: 'simple-json' })
  problems: string[];

  @Column({ type: 'simple-json' })
  considerations: string[];

  @Column({ type: 'simple-json' })
  deliverables: string[];

  /** Three labels for the simplified "approach" diagram. */
  @Column({ type: 'simple-json' })
  flow: string[];

  @Column({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
