import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('staff_users')
export class StaffUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 200 })
  email: string;

  @Column({ type: 'varchar', length: 120, default: '' })
  name: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 100 })
  passwordHash: string;

  @Column({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @Column({ name: 'last_login_at', type: 'datetime', nullable: true })
  lastLoginAt: Date | null;
}
