import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { config } from '../config';
import { FieldErrors, FieldValidationException } from '../common/field-errors';
import { EMAIL_RE, raw, str } from '../common/utils';
import { StaffUser } from '../database/entities';

export interface StaffSession {
  sub: number;
  email: string;
  name: string;
}

const DUMMY_HASH = bcrypt.hashSync('timing-equaliser-not-a-password', 10);

const publicUser =(u: StaffUser) => ({ id: u.id, email: u.email, name: u.name, lastLoginAt: u.lastLoginAt });

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(StaffUser) private readonly users: Repository<StaffUser>,
    private readonly jwt: JwtService,
  ) {}

  /** Creates the initial staff account from env vars when none exists. */
  async ensureSeedUser() {
    if (await this.users.count()) return;
    const { email, password, name } = config.staffSeed;
    await this.users.save(
      this.users.create({ email, name, passwordHash: await bcrypt.hash(password, 10), createdAt: new Date(), lastLoginAt: null }),
    );
  }

  async login(body: Record<string, unknown>) {
    const email = str(body?.email).toLowerCase();
    const password = raw(body?.password);
    const err: FieldErrors = {};
    if (!email) err.email = 'Enter your email address.';
    else if (!EMAIL_RE.test(email)) err.email = 'Enter a valid email address.';
    if (!password) err.password = 'Enter your password.';
    else if (password.length < 8) err.password = 'Passwords are at least 8 characters.';
    if (Object.keys(err).length) throw new FieldValidationException(err);

    const user = await this.users.findOne({ where: { email } });
    // Compare against a dummy hash for unknown emails so response time doesn't reveal which accounts exist.
    const ok = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
    if (!user || !ok) throw new UnauthorizedException('That email and password combination is not recognised.');

    user.lastLoginAt = new Date();
    await this.users.save(user);
    const token = await this.jwt.signAsync({ sub: user.id, email: user.email, name: user.name } satisfies StaffSession);
    return { token, user: publicUser(user) };
  }

  async verify(token: string): Promise<StaffSession> {
    try {
      const s = await this.jwt.verifyAsync<StaffSession>(token);
      const exists = await this.users.exists({ where: { id: s.sub } });
      if (!exists) throw new Error('gone');
      return s;
    } catch {
      throw new UnauthorizedException('Your session has ended. Please sign in again.');
    }
  }

  async me(id: number) {
    const u = await this.users.findOne({ where: { id } });
    if (!u) throw new UnauthorizedException('Your session has ended. Please sign in again.');
    return publicUser(u);
  }

  async changePassword(id: number, body: Record<string, unknown>) {
    const current = raw(body?.currentPassword);
    const next = raw(body?.newPassword);
    const confirm = raw(body?.confirmPassword);
    const err: FieldErrors = {};
    if (!current) err.currentPassword = 'Enter your current password.';
    if (!next) err.newPassword = 'Enter a new password.';
    else if (next.length < 10) err.newPassword = 'Use at least 10 characters.';
    else if (!/[A-Za-z]/.test(next) || !/\d/.test(next)) err.newPassword = 'Include at least one letter and one number.';
    if (next && confirm !== next) err.confirmPassword = 'The passwords don’t match.';
    if (Object.keys(err).length) throw new FieldValidationException(err);

    const u = await this.users.findOne({ where: { id } });
    if (!u) throw new UnauthorizedException();
    if (!(await bcrypt.compare(current, u.passwordHash))) throw new FieldValidationException({ currentPassword: 'Your current password is incorrect.' });
    u.passwordHash = await bcrypt.hash(next, 10);
    await this.users.save(u);
    return { message: 'Password updated.' };
  }
}
