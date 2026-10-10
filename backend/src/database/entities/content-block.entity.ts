import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * Structured page content (challenges, process stages, principles, values,
 * solutions, hero diagrams…) stored as JSON under a key. Served by GET /api/content.
 */
@Entity('content_blocks')
export class ContentBlock {
  @PrimaryColumn({ type: 'varchar', length: 40 })
  key: string;

  @Column({ type: 'simple-json' })
  data: object;

  @Column({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;
}
