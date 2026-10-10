import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

export type EnquiryStatus = 'new' | 'in_review' | 'replied' | 'closed';

/** A project enquiry submitted from the contact page. */
@Entity('enquiries')
export class Enquiry {
  /** Reference shown to the visitor, e.g. "E-7Q2K9D". */
  @PrimaryColumn({ type: 'varchar', length: 16 })
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 12, default: 'new' })
  status: EnquiryStatus;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 254 })
  email: string;

  @Column({ type: 'varchar', length: 120, default: '' })
  company: string;

  /** Service id, "unsure", or empty when not chosen. */
  @Index()
  @Column({ name: 'service_id', type: 'varchar', length: 40, default: '' })
  serviceId: string;

  /** Service name at the time of the enquiry (kept even if the service is renamed). */
  @Column({ name: 'service_name', type: 'varchar', length: 80, default: '' })
  serviceName: string;

  @Column({ type: 'varchar', length: 60, default: '' })
  budget: string;

  @Column({ type: 'varchar', length: 60, default: '' })
  timeline: string;

  @Column({ type: 'varchar', length: 300, default: '' })
  url: string;

  @Column({ type: 'text' })
  description: string;

  /** Internal notes — staff only. */
  @Column({ name: 'staff_notes', type: 'text', default: '' })
  staffNotes: string;

  @Index()
  @Column({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
