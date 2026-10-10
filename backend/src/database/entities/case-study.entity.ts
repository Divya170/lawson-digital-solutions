import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

export type CaseStudyStatus = 'draft' | 'published';

/**
 * A client case study. Only "published" ones appear on /projects — the
 * prototype's rule that work is shown only once the client approves it.
 */
@Entity('case_studies')
export class CaseStudy {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 120 })
  slug: string;

  @Column({ type: 'varchar', length: 160 })
  title: string;

  /** Client name, only if the client agreed to be named. */
  @Column({ type: 'varchar', length: 120, default: '' })
  client: string;

  @Column({ name: 'service_id', type: 'varchar', length: 40, default: '' })
  serviceId: string;

  @Column({ type: 'text', default: '' })
  summary: string;

  /** The four sections every case study covers (see "What each case study will cover"). */
  @Column({ type: 'text', default: '' })
  requirement: string;

  @Column({ type: 'text', default: '' })
  approach: string;

  @Column({ type: 'text', default: '' })
  delivered: string;

  @Column({ type: 'text', default: '' })
  results: string;

  @Column({ name: 'cover_image', type: 'varchar', length: 500, default: '' })
  coverImage: string;

  @Index()
  @Column({ type: 'varchar', length: 12, default: 'draft' })
  status: CaseStudyStatus;

  @Column({ name: 'published_at', type: 'datetime', nullable: true })
  publishedAt: Date | null;

  @Column({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
